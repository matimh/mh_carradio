import { ActionIcon, Box, Button, Group, ScrollArea, Stack, Text } from '@mhdesign/core'; // JUST A MANTINE FORK, CHANGE TO MANTINE IF YOU WANT - WILL WORK 100% FINE.
import { IconPlayerPlay, IconTrash } from '@tabler/icons-react';
import type { Playlist } from '../types/carradio';

interface Props {
  playlist: Playlist | null;
  maxSongs: number;
  onPlay: (id: number) => void;
  onRemoveSong: (id: number, url: string) => void;
}

const PlaylistSongs = ({ playlist, maxSongs, onPlay, onRemoveSong }: Props) => {
  if (!playlist) {
    return (
      <Box p={16} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text size="sm" c="dimmed">
          Wybierz playliste z listy po lewej
        </Text>
      </Box>
    );
  }

  return (
    <Box p={16} style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Group justify="space-between" mb={10}>
        <Box>
          <Text size="sm" fw={700}>
            {playlist.name}
          </Text>
          <Text size="xs" c="dimmed">
            {playlist.songs.length}/{maxSongs} utworow
          </Text>
        </Box>
        <Button
          size="xs"
          leftSection={<IconPlayerPlay size={14} />}
          disabled={playlist.songs.length === 0}
          onClick={() => onPlay(playlist.id)}
        >
          Odtworz playliste
        </Button>
      </Group>

      <ScrollArea style={{ flex: 1 }} scrollbarSize={4} type="auto">
        <Stack gap={4}>
          {playlist.songs.map((song) => (
            <Group
              key={song.url}
              justify="space-between"
              wrap="nowrap"
              p={6}
              style={{ borderRadius: 6, background: 'rgba(255,255,255,0.03)' }}
            >
              <Text size="xs" truncate style={{ minWidth: 0, flex: 1 }}>
                {song.title}
              </Text>
              <ActionIcon size="sm" variant="subtle" color="red" onClick={() => onRemoveSong(playlist.id, song.url)}>
                <IconTrash size={14} />
              </ActionIcon>
            </Group>
          ))}
          {playlist.songs.length === 0 && (
            <Text size="xs" c="dimmed" ta="center" mt={20}>
              Pusta playlista
            </Text>
          )}
        </Stack>
      </ScrollArea>
    </Box>
  );
};

export default PlaylistSongs;
