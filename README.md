# mh_carradio

simple script with nice nui for music in cars. honestly 50% by me, 50% vibecoded. 

## preview:
<p align="center">
  <a href="https://www.youtube.com/watch?v=rUiJ25vpB1s">
    <img src="https://github.com/user-attachments/assets/dff9d838-88ea-4a61-b500-7eb06ddefbac"> (click on it)/>
  </a>
</p>
## Requirements

- `ox_lib`
- `oxmysql`
- `xsound`

## Installation

1. Import `mh_carradio.sql` into your database.
2. Add `mh_carradio` to your server resources.
3. Ensure its dependencies start before this resource.
4. Use `/carradio` while inside a vehicle.

## ESX

`mh_carradio` uses `mh_lib` by default. If you use ESX, replace the `mh_lib` framework code in `server/main.lua` with your ESX equivalent. `xsound` is required in every setup.
