local youtubeHosts = {
    ['youtube.com'] = true,
    ['www.youtube.com'] = true,
    ['m.youtube.com'] = true,
    ['music.youtube.com'] = true,
}

function IsValidYoutubeUrl(url)
    if type(url) ~= 'string' or #url > 300 then
        return false
    end

    local host, path = url:match('^https?://([%w%.%-]+)(/.*)$')
    if not host then
        return false
    end
    host = host:lower()

    if youtubeHosts[host] then
        return path:match('^/watch%?v=[%w_%-]+') ~= nil or path:match('^/shorts/[%w_%-]+') ~= nil
    end

    return host == 'youtu.be' and path:match('^/[%w_%-]+') ~= nil
end
