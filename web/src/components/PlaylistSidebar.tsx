import { useState } from 'react';
import { ActionIcon, Box, Button, ScrollArea, Stack, Text, TextInput, UnstyledButton } from '@mhdesign/core'; // JUST A MANTINE FORK, CHANGE TO MANTINE IF YOU WANT - WILL WORK 100% FINE.
import { IconPlaylist, IconPlus, IconTrash } from '@tabler/icons-react';
import type { Playlist } from '../types/carradio';

interface CreateResponse {
  ok: boolean;
  message?: string;
}

interface Props {
  playlists: Playlist[];
  selectedId: number | null;
  maxPlaylists: number;
  maxNameLength: number;
  onSelect: (id: number) => void;
  onCreate: (name: string) => Promise<CreateResponse>;
  onDelete: (id: number) => void;
}

const PlaylistSidebar = ({
  playlists,
  selectedId,
  maxPlaylists,
  maxNameLength,
  onSelect,
  onCreate,
  onDelete,
}: Props) => {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submitCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const response = await onCreate(trimmed);

    if (response.ok) {
      setName('');
      setCreating(false);
      setError(null);
    } else {
      setError(response.message ?? 'Nie udalo sie utworzyc playlisty.');
    }
  };

  return (
    <Box
      w={220}
      style={{
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 12px',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(0,0,0,0.2)',
      }}
    >
      <Text size="sm" fw={700} c="white" mb={10} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <IconPlaylist size={16} />
        Playlisty
      </Text>

      <ScrollArea style={{ flex: 1 }} scrollbarSize={4} type="auto">
        <Stack gap={4}>
          {playlists.map((playlist) => {
            const active = playlist.id === selectedId;

            return (
              <UnstyledButton
                key={playlist.id}
                onClick={() => onSelect(playlist.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: 8,
                  background: active ? 'var(--mantine-color-royal-purple-6)' : 'transparent',
                  color: active ? '#fff' : 'rgba(255,255,255,0.7)',
                }}
              >
                <Box style={{ minWidth: 0 }}>
                  <Text size="sm" fw={active ? 600 : 500} truncate>
                    {playlist.name}
                  </Text>
                  <Text size="xs" c={active ? 'rgba(255,255,255,0.75)' : 'dimmed'}>
                    {playlist.songs.length} utworow
                  </Text>
                </Box>
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color={active ? 'white' : 'gray'}
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete(playlist.id);
                  }}
                >
                  <IconTrash size={14} />
                </ActionIcon>
              </UnstyledButton>
            );
          })}
        </Stack>
      </ScrollArea>

      {creating ? (
        <Stack gap={6} mt={10}>
          <TextInput
            size="xs"
            placeholder="Nazwa playlisty"
            value={name}
            maxLength={maxNameLength}
            onChange={(event) => setName(event.currentTarget.value)}
            onKeyDown={(event) => event.key === 'Enter' && submitCreate()}
            autoFocus
          />
          {error && (
            <Text size="xs" c="red">
              {error}
            </Text>
          )}
          <Button size="xs" onClick={submitCreate}>
            Zapisz
          </Button>
        </Stack>
      ) : (
        <Button
          size="xs"
          variant="solid"
          mt={10}
          leftSection={<IconPlus size={14} />}
          disabled={playlists.length >= maxPlaylists}
          onClick={() => setCreating(true)}
        >
          Nowa playlista
        </Button>
      )}
    </Box>
  );
};

export default PlaylistSidebar;
