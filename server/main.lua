local MH = exports.mh_lib:getSharedObject() -- CHANGE IT TO ESX IF U WANT!
local databaseReady = false
local ActiveRadios = {}

local function dbAwait(label, fn, query, params)
    local ok, result = pcall(fn, query, params or {})

    if not ok then
        print(('[mh_carradio] SQL error (%s): %s'):format(label, result))
        return nil
    end

    return result
end

local function getIdentifier(source)
    local xPlayer = MH.GetPlayerFromId(source)

    if not xPlayer then
        return nil
    end

    return xPlayer.identifier
end

local function getVehicleForPlayer(source, vehicleNetId)
    local ped = GetPlayerPed(source)
    local veh = GetVehiclePedIsIn(ped, false)

    if not veh or veh == 0 then
        return nil
    end

    if NetworkGetNetworkIdFromEntity(veh) ~= tonumber(vehicleNetId) then
        return nil
    end

    return veh
end

local function sanitizePlaylistName(name)
    if type(name) ~= 'string' then
        return nil
    end

    name = name:gsub('^%s+', ''):gsub('%s+$', '')

    if name == '' or #name > Config.MaxPlaylistNameLength then
        return nil
    end

    return name
end

local function youtubeId(url)
    return url:match('[?&]v=([%w_%-]+)') or url:match('/shorts/([%w_%-]+)') or url:match('youtu%.be/([%w_%-]+)')
end

local function sanitizeSong(song)
    if type(song) ~= 'table' or not IsValidYoutubeUrl(song.url) then
        return nil
    end

    local videoId = youtubeId(song.url)

    return {
        title = type(song.title) == 'string' and song.title:sub(1, 100) or 'Nieznany utwor',
        url = song.url,
        thumbnail = videoId and ('https://img.youtube.com/vi/%s/hqdefault.jpg'):format(videoId:sub(1, 32)) or nil
    }
end

local function rowToPlaylist(row)
    local ok, songs = pcall(json.decode, row.songs)

    return {
        id = row.id,
        name = row.name,
        songs = ok and songs or {}
    }
end

local function getPlaylists(identifier)
    if not databaseReady or not identifier then
        return {}
    end

    local rows = dbAwait('get_playlists', MySQL.query.await,
        'SELECT id, name, songs FROM mh_carradio_playlists WHERE identifier = ? ORDER BY id ASC',
        { identifier }
    )

    local playlists = {}

    if rows then
        for i = 1, #rows do
            playlists[#playlists + 1] = rowToPlaylist(rows[i])
        end
    end

    return playlists
end

local function getOwnedPlaylist(identifier, id)
    if not databaseReady or not identifier or not id then
        return nil
    end

    local row = dbAwait('get_playlist', MySQL.single.await,
        'SELECT id, name, songs FROM mh_carradio_playlists WHERE id = ? AND identifier = ? LIMIT 1',
        { id, identifier }
    )

    return row and rowToPlaylist(row) or nil
end

local function broadcastRadio(vehicleNetId)
    TriggerClientEvent('mh_carradio:client:radioUpdated', -1, vehicleNetId, ActiveRadios[vehicleNetId])
end

local function setActiveRadio(vehicleNetId, queue, index, volume, playing)
    ActiveRadios[vehicleNetId] = {
        queue = queue,
        index = index,
        volume = volume,
        playing = playing
    }

    broadcastRadio(vehicleNetId)

    return ActiveRadios[vehicleNetId]
end

CreateThread(function()
    dbAwait('create_table', MySQL.query.await, [[
        CREATE TABLE IF NOT EXISTS `mh_carradio_playlists` (
            `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
            `identifier` VARCHAR(128) NOT NULL,
            `name` VARCHAR(50) NOT NULL,
            `songs` LONGTEXT NOT NULL,
            `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `identifier` (`identifier`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ]])

    databaseReady = true
end)

CreateThread(function()
    while true do
        Wait(15000)

        for vehicleNetId in pairs(ActiveRadios) do
            local veh = NetworkGetEntityFromNetworkId(vehicleNetId)

            if not veh or veh == 0 or not DoesEntityExist(veh) then
                ActiveRadios[vehicleNetId] = nil
                broadcastRadio(vehicleNetId)
            end
        end
    end
end)

RegisterNetEvent('mh_carradio:server:requestSync', function()
    TriggerClientEvent('mh_carradio:client:fullSync', source, ActiveRadios)
end)

lib.callback.register('mh_carradio:server:getPanelData', function(source, vehicleNetId)
    local identifier = getIdentifier(source)

    return {
        playlists = getPlaylists(identifier),
        radio = ActiveRadios[vehicleNetId],
        maxPlaylists = Config.MaxPlaylists,
        maxSongsPerPlaylist = Config.MaxSongsPerPlaylist,
        maxPlaylistNameLength = Config.MaxPlaylistNameLength
    }
end)

lib.callback.register('mh_carradio:server:playUrl', function(source, data)
    if type(data) ~= 'table' then
        return { ok = false }
    end

    local song = sanitizeSong(data)

    if not song then
        return { ok = false, message = 'Nieprawidlowy link YouTube.' }
    end

    if not getVehicleForPlayer(source, data.vehicleNetId) then
        return { ok = false, message = 'Musisz byc w pojezdzie.' }
    end

    local radio = setActiveRadio(data.vehicleNetId, { song }, 1, Config.DefaultVolume, true)

    return { ok = true, radio = radio }
end)

lib.callback.register('mh_carradio:server:playPlaylist', function(source, data)
    if type(data) ~= 'table' then
        return { ok = false }
    end

    local identifier = getIdentifier(source)
    local playlist = getOwnedPlaylist(identifier, data.id)

    if not playlist or #playlist.songs == 0 then
        return { ok = false, message = 'Playlista jest pusta lub nie istnieje.' }
    end

    if not getVehicleForPlayer(source, data.vehicleNetId) then
        return { ok = false, message = 'Musisz byc w pojezdzie.' }
    end

    local songs = {}

    for _, entry in ipairs(playlist.songs) do
        local clean = sanitizeSong(entry)

        if clean then
            songs[#songs + 1] = clean
        end
    end

    if #songs == 0 then
        return { ok = false, message = 'Playlista jest pusta lub nie istnieje.' }
    end

    local radio = setActiveRadio(data.vehicleNetId, songs, 1, Config.DefaultVolume, true)

    return { ok = true, radio = radio }
end)

lib.callback.register('mh_carradio:server:controlRadio', function(source, data)
    if type(data) ~= 'table' then
        return { ok = false }
    end

    local state = ActiveRadios[data.vehicleNetId]

    if not state then
        return { ok = false, message = 'Radio jest wylaczone.' }
    end

    if not getVehicleForPlayer(source, data.vehicleNetId) then
        return { ok = false, message = 'Musisz byc w pojezdzie.' }
    end

    if data.action == 'pause' then
        state.playing = false
    elseif data.action == 'resume' then
        state.playing = true
    elseif data.action == 'stop' then
        ActiveRadios[data.vehicleNetId] = nil
        broadcastRadio(data.vehicleNetId)

        return { ok = true, radio = nil }
    elseif data.action == 'next' then
        state.index = (state.index % #state.queue) + 1
        state.playing = true
    elseif data.action == 'prev' then
        state.index = ((state.index - 2) % #state.queue) + 1
        state.playing = true
    else
        return { ok = false }
    end

    broadcastRadio(data.vehicleNetId)

    return { ok = true, radio = state }
end)

lib.callback.register('mh_carradio:server:setVolume', function(source, data)
    if type(data) ~= 'table' or type(data.volume) ~= 'number' then
        return { ok = false }
    end

    local state = ActiveRadios[data.vehicleNetId]

    if not state then
        return { ok = false }
    end

    if not getVehicleForPlayer(source, data.vehicleNetId) then
        return { ok = false }
    end

    state.volume = math.max(0, math.min(1, data.volume))
    broadcastRadio(data.vehicleNetId)

    return { ok = true, radio = state }
end)

lib.callback.register('mh_carradio:server:createPlaylist', function(source, data)
    local identifier = getIdentifier(source)
    local name = type(data) == 'table' and sanitizePlaylistName(data.name) or nil

    if not identifier or not name then
        return { ok = false, message = 'Nieprawidlowa nazwa playlisty.', playlists = getPlaylists(identifier) }
    end

    if #getPlaylists(identifier) >= Config.MaxPlaylists then
        return { ok = false, message = 'Osiagnieto limit playlist.', playlists = getPlaylists(identifier) }
    end

    dbAwait('create_playlist', MySQL.insert.await,
        'INSERT INTO mh_carradio_playlists (identifier, name, songs) VALUES (?, ?, ?)',
        { identifier, name, json.encode({}) }
    )

    return { ok = true, playlists = getPlaylists(identifier) }
end)

lib.callback.register('mh_carradio:server:deletePlaylist', function(source, data)
    local identifier = getIdentifier(source)
    local id = type(data) == 'table' and tonumber(data.id) or nil

    if identifier and id then
        dbAwait('delete_playlist', MySQL.update.await,
            'DELETE FROM mh_carradio_playlists WHERE id = ? AND identifier = ?',
            { id, identifier }
        )
    end

    return { ok = true, playlists = getPlaylists(identifier) }
end)

lib.callback.register('mh_carradio:server:addSongToPlaylist', function(source, data)
    local identifier = getIdentifier(source)
    local id = type(data) == 'table' and tonumber(data.id) or nil
    local song = type(data) == 'table' and sanitizeSong(data.song) or nil
    local playlist = id and getOwnedPlaylist(identifier, id) or nil

    if not playlist or not song then
        return { ok = false, message = 'Nie udalo sie dodac utworu.', playlists = getPlaylists(identifier) }
    end

    if #playlist.songs >= Config.MaxSongsPerPlaylist then
        return { ok = false, message = 'Playlista jest pelna.', playlists = getPlaylists(identifier) }
    end

    for i = 1, #playlist.songs do
        if playlist.songs[i].url == song.url then
            return { ok = false, message = 'Ten utwor jest juz na playliscie.', playlists = getPlaylists(identifier) }
        end
    end

    playlist.songs[#playlist.songs + 1] = song

    dbAwait('add_song', MySQL.update.await,
        'UPDATE mh_carradio_playlists SET songs = ? WHERE id = ? AND identifier = ?',
        { json.encode(playlist.songs), id, identifier }
    )

    return { ok = true, playlists = getPlaylists(identifier) }
end)

lib.callback.register('mh_carradio:server:removeSongFromPlaylist', function(source, data)
    local identifier = getIdentifier(source)
    local id = type(data) == 'table' and tonumber(data.id) or nil
    local url = type(data) == 'table' and data.url or nil
    local playlist = id and getOwnedPlaylist(identifier, id) or nil

    if not playlist or not url then
        return { ok = false, playlists = getPlaylists(identifier) }
    end

    local songs = {}

    for i = 1, #playlist.songs do
        if playlist.songs[i].url ~= url then
            songs[#songs + 1] = playlist.songs[i]
        end
    end

    dbAwait('remove_song', MySQL.update.await,
        'UPDATE mh_carradio_playlists SET songs = ? WHERE id = ? AND identifier = ?',
        { json.encode(songs), id, identifier }
    )

    return { ok = true, playlists = getPlaylists(identifier) }
end)
