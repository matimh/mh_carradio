import { useCallback, useMemo, useState } from 'react';
import { Box, Flex, MantineProvider } from '@mhdesign/core'; // JUST A MANTINE FORK, CHANGE TO MANTINE IF YOU WANT - WILL WORK 100% FINE.
import '@mhdesign/core/styles.css'; // JUST A MANTINE FORK, CHANGE TO MANTINE IF YOU WANT - WILL WORK 100% FINE.
import { createCarradioTheme } from './theme';
import { DEFAULT_BRAND } from './utils/color';
import { VisibilityProvider } from './providers/VisibilityProvider';
import { useNuiEvent } from './hooks/useNuiEvent';
import { fetchNui } from './utils/fetchNui';
import { debugData } from './utils/debugData';
import NuiFrame from './components/NuiFrame';
import PlaylistSidebar from './components/PlaylistSidebar';
import NowPlaying from './components/NowPlaying';
import LinkInput from './components/LinkInput';
import PlaylistSongs from './components/PlaylistSongs';
import type { PanelData, Playlist, RadioState, Song } from './types/carradio';

debugData<PanelData>([
  {
    action: 'setPanelData',
    data: {
      playlists: [{ id: 1, name: 'Ulubione', songs: [] }],
      radio: null,
      maxPlaylists: 15,
      maxSongsPerPlaylist: 40,
      maxPlaylistNameLength: 30,
    },
  },
]);

interface MutationResponse {
  ok: boolean;
  message?: string;
  playlists: Playlist[];
}

const App = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [radio, setRadio] = useState<RadioState | null>(null);
  const [limits, setLimits] = useState({ maxPlaylists: 15, maxSongsPerPlaylist: 40, maxPlaylistNameLength: 30 });
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<number | null>(null);
  const [mainColor, setMainColorRaw] = useState(() => {
    try {
      return localStorage.getItem('mh_main_color') || DEFAULT_BRAND;
    } catch {
      return DEFAULT_BRAND;
    }
  });
  const setMainColor = (color: string) => {
    setMainColorRaw(color);
    try {
      localStorage.setItem('mh_main_color', color);
    } catch {
      // ignore
    }
  };
  const theme = useMemo(() => createCarradioTheme(mainColor), [mainColor]);

  useNuiEvent<string>('setMainColor', (color) => {
    if (typeof color === 'string' && color) setMainColor(color);
  });

  useNuiEvent<PanelData>('setPanelData', (data) => {
    setPlaylists(data.playlists);
    setRadio(data.radio);
    setLimits({
      maxPlaylists: data.maxPlaylists,
      maxSongsPerPlaylist: data.maxSongsPerPlaylist,
      maxPlaylistNameLength: data.maxPlaylistNameLength,
    });
  });

  useNuiEvent<RadioState | null>('setRadioState', setRadio);

  const selectedPlaylist = playlists.find((playlist) => playlist.id === selectedPlaylistId) ?? null;
  const currentSong = radio && radio.queue.length > 0 ? (radio.queue[radio.index - 1] ?? null) : null;

  const handlePlayUrl = useCallback(async (song: Song) => {
    const response = await fetchNui<{ ok: boolean; message?: string; radio?: RadioState }>('playUrl', song);
    if (response.ok && response.radio) setRadio(response.radio);
    return response;
  }, []);

  const handleControl = useCallback(async (action: 'pause' | 'resume' | 'stop' | 'next' | 'prev') => {
    const response = await fetchNui<{ ok: boolean; radio?: RadioState | null }>('controlRadio', { action });
    if (response.ok) setRadio(response.radio ?? null);
  }, []);

  const handleVolume = useCallback(async (volume: number) => {
    const response = await fetchNui<{ ok: boolean; radio?: RadioState }>('setVolume', { volume });
    if (response.ok && response.radio) setRadio(response.radio);
  }, []);

  const handleCreatePlaylist = useCallback(async (name: string) => {
    const response = await fetchNui<MutationResponse>('createPlaylist', { name });
    setPlaylists(response.playlists);
    return response;
  }, []);

  const handleDeletePlaylist = useCallback(
    async (id: number) => {
      const response = await fetchNui<MutationResponse>('deletePlaylist', { id });
      setPlaylists(response.playlists);
      if (selectedPlaylistId === id) setSelectedPlaylistId(null);
    },
    [selectedPlaylistId]
  );

  const handleAddSong = useCallback(async (id: number, song: Song) => {
    const response = await fetchNui<MutationResponse>('addSongToPlaylist', { id, song });
    setPlaylists(response.playlists);
    return response;
  }, []);

  const handleRemoveSong = useCallback(async (id: number, url: string) => {
    const response = await fetchNui<MutationResponse>('removeSongFromPlaylist', { id, url });
    setPlaylists(response.playlists);
  }, []);

  const handlePlayPlaylist = useCallback(async (id: number) => {
    const response = await fetchNui<{ ok: boolean; message?: string; radio?: RadioState }>('playPlaylist', { id });
    if (response.ok && response.radio) setRadio(response.radio);
  }, []);

  const handleClose = useCallback(() => {
    fetchNui('hide-ui');
  }, []);

  const handleAddCurrentToPlaylist = useCallback(() => {
    if (selectedPlaylist && currentSong) handleAddSong(selectedPlaylist.id, currentSong);
  }, [selectedPlaylist, currentSong, handleAddSong]);

  return (
    <MantineProvider theme={theme} defaultColorScheme="dark" forceColorScheme="dark">
      <VisibilityProvider>
        <NuiFrame>
          <Flex style={{ flex: 1, minHeight: 0 }}>
            <PlaylistSidebar
              playlists={playlists}
              selectedId={selectedPlaylistId}
              maxPlaylists={limits.maxPlaylists}
              maxNameLength={limits.maxPlaylistNameLength}
              onSelect={setSelectedPlaylistId}
              onCreate={handleCreatePlaylist}
              onDelete={handleDeletePlaylist}
            />
            <Box style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <NowPlaying
                song={currentSong}
                playing={radio?.playing ?? false}
                volume={radio?.volume ?? 0.3}
                hasQueue={(radio?.queue.length ?? 0) > 1}
                canAddToPlaylist={Boolean(selectedPlaylist && currentSong)}
                onClose={handleClose}
                onControl={handleControl}
                onVolume={handleVolume}
                onAddToPlaylist={handleAddCurrentToPlaylist}
              />
              <LinkInput onPlay={handlePlayUrl} />
              <PlaylistSongs
                playlist={selectedPlaylist}
                maxSongs={limits.maxSongsPerPlaylist}
                onPlay={handlePlayPlaylist}
                onRemoveSong={handleRemoveSong}
              />
            </Box>
          </Flex>
        </NuiFrame>
      </VisibilityProvider>
    </MantineProvider>
  );
};

export default App;
