local xSound = exports.xsound

local panelOpen = false
local currentVehicleNetId = nil
local localSongUrls = {}
local function notify(description, notifyType)
    lib.notify({
        title = 'Radio',
        description = description,
        type = notifyType or 'info'
    })
end

local function getPlayerVehicle()
    local veh = GetVehiclePedIsIn(PlayerPedId(), false)

    if not veh or veh == 0 then
        return nil
    end

    return veh
end

local function closePanel()
    if not panelOpen then
        return
    end

    panelOpen = false
    currentVehicleNetId = nil
    SetNuiFocus(false, false)
    SendNUIMessage({ action = 'setVisible', data = false })
end

local function musicIdFor(vehicleNetId)
    return ('mh_carradio_%s'):format(vehicleNetId)
end

local function stopLocalRadio(vehicleNetId)
    local musicId = musicIdFor(vehicleNetId)

    if xSound:soundExists(musicId) then
        xSound:Destroy(musicId)
    end

    localSongUrls[vehicleNetId] = nil
end

local function trackVehiclePosition(vehicleNetId, musicId, url)
    CreateThread(function()
        while localSongUrls[vehicleNetId] == url and xSound:soundExists(musicId) do
            local veh = NetworkGetEntityFromNetworkId(vehicleNetId)

            if not veh or veh == 0 or not DoesEntityExist(veh) then
                stopLocalRadio(vehicleNetId)
                break
            end

            xSound:Position(musicId, GetEntityCoords(veh))
            Wait(Config.PositionUpdateInterval)
        end
    end)
end

local function applyRadioState(vehicleNetId, state)
    local musicId = musicIdFor(vehicleNetId)

    if not state or not state.queue or not state.queue[state.index] then
        stopLocalRadio(vehicleNetId)
    else
        local song = state.queue[state.index]
        local veh = NetworkGetEntityFromNetworkId(vehicleNetId)

        if veh and veh ~= 0 and DoesEntityExist(veh) then
            if localSongUrls[vehicleNetId] ~= song.url then
                if xSound:soundExists(musicId) then
                    xSound:Destroy(musicId)
                end

                xSound:PlayUrlPos(musicId, song.url, state.volume, GetEntityCoords(veh))
                xSound:Distance(musicId, Config.MaxDistance)
                localSongUrls[vehicleNetId] = song.url
                trackVehiclePosition(vehicleNetId, musicId, song.url)
            end

            if xSound:soundExists(musicId) then
                xSound:setVolume(musicId, state.volume)

                if state.playing then
                    xSound:Resume(musicId)
                else
                    xSound:Pause(musicId)
                end
            end
        end
    end

    if panelOpen and currentVehicleNetId == vehicleNetId then
        SendNUIMessage({ action = 'setRadioState', data = state })
    end
end

RegisterNetEvent('mh_carradio:client:radioUpdated', function(vehicleNetId, state)
    applyRadioState(vehicleNetId, state)
end)

RegisterNetEvent('mh_carradio:client:fullSync', function(allRadios)
    for vehicleNetId, state in pairs(allRadios) do
        applyRadioState(vehicleNetId, state)
    end
end)

CreateThread(function()
    Wait(2000)
    TriggerServerEvent('mh_carradio:server:requestSync')
end)

CreateThread(function()
    while true do
        Wait(1000)

        if panelOpen then
            local veh = getPlayerVehicle()

            if not veh or NetworkGetNetworkIdFromEntity(veh) ~= currentVehicleNetId then
                closePanel()
            end
        end
    end
end)

RegisterCommand(Config.Command, function()
    if panelOpen then
        return
    end

    local veh = getPlayerVehicle()

    if not veh then
        notify('Musisz byc w pojezdzie, aby wlaczyc radio.', 'error')
        return
    end

    local vehicleNetId = NetworkGetNetworkIdFromEntity(veh)
    local data = lib.callback.await('mh_carradio:server:getPanelData', false, vehicleNetId)

    if not data then
        notify('Radio jest niedostepne.', 'error')
        return
    end

    panelOpen = true
    currentVehicleNetId = vehicleNetId

    SetNuiFocus(true, true)
    SendNUIMessage({ action = 'setMainColor', data = mainColor })
    SendNUIMessage({ action = 'setVisible', data = true })
    SendNUIMessage({ action = 'setPanelData', data = data })
end, false)

RegisterNUICallback('hide-ui', function(_, cb)
    closePanel()
    cb({ ok = true })
end)

RegisterNUICallback('playUrl', function(data, cb)
    data = data or {}
    data.vehicleNetId = currentVehicleNetId

    cb(lib.callback.await('mh_carradio:server:playUrl', false, data) or { ok = false })
end)

RegisterNUICallback('playPlaylist', function(data, cb)
    data = data or {}
    data.vehicleNetId = currentVehicleNetId

    cb(lib.callback.await('mh_carradio:server:playPlaylist', false, data) or { ok = false })
end)

RegisterNUICallback('controlRadio', function(data, cb)
    data = data or {}
    data.vehicleNetId = currentVehicleNetId

    cb(lib.callback.await('mh_carradio:server:controlRadio', false, data) or { ok = false })
end)

RegisterNUICallback('setVolume', function(data, cb)
    data = data or {}
    data.vehicleNetId = currentVehicleNetId

    cb(lib.callback.await('mh_carradio:server:setVolume', false, data) or { ok = false })
end)

RegisterNUICallback('createPlaylist', function(data, cb)
    local response = lib.callback.await('mh_carradio:server:createPlaylist', false, data)

    if response and not response.ok and response.message then
        notify(response.message, 'error')
    end

    cb(response or { ok = false })
end)

RegisterNUICallback('deletePlaylist', function(data, cb)
    cb(lib.callback.await('mh_carradio:server:deletePlaylist', false, data) or { ok = false })
end)

RegisterNUICallback('addSongToPlaylist', function(data, cb)
    local response = lib.callback.await('mh_carradio:server:addSongToPlaylist', false, data)

    if response and not response.ok and response.message then
        notify(response.message, 'error')
    end

    cb(response or { ok = false })
end)

RegisterNUICallback('removeSongFromPlaylist', function(data, cb)
    cb(lib.callback.await('mh_carradio:server:removeSongFromPlaylist', false, data) or { ok = false })
end)
