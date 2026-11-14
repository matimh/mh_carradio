fx_version 'cerulean'
game 'gta5'

author 'matimh.eu'
description 'mh_carradio'

lua54 'yes'

shared_scripts {
    '@ox_lib/init.lua',
    'shared/config.lua',
    'shared/utils.lua'
}

-- client_script '@mh_loader/client.lua'
-- my_data 'client_files' { "client/main.lua" }
-- server_script '@mh_loader/server.lua'

client_scripts {
    'client/main.lua'
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/main.lua'
}

ui_page 'web/build/index.html'

files {
    'web/build/index.html',
    'web/build/assets/*.js',
    'web/build/assets/*.css',
    'web/build/assets/*.woff2',
}