import { ActionIcon, Box, Group, Image, Slider, Text } from '@mhdesign/core';
import {
  IconMusic,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlayerStop,
  IconPlayerTrackNext,
  IconPlayerTrackPrev,
  IconPlaylistAdd,
  IconX,
} from '@tabler/icons-react';
import type { Song } from '../types/carradio';

type RadioAction = 'pause' | 'resume' | 'stop' | 'next' | 'prev';

interface Props {
  song: Song | null;
  playing: boolean;
  volume: number;
  hasQueue: boolean;
  canAddToPlaylist: boolean;
  onClose: () => void;
  onControl: (action: RadioAction) => void;
  onVolume: (volume: number) => void;
  onAddToPlaylist: () => void;
}

const NowPlaying = ({
  song,
  playing,
  volume,
  hasQueue,
  canAddToPlaylist,
  onClose,
  onControl,
  onVolume,
  onAddToPlaylist,
}: Props) => {
  return (
    <Box
      p={16}
      style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', gap: 12 }}
    >
      <Group justify="space-between" wrap="nowrap">
        <Group gap={10} wrap="nowrap" style={{ minWidth: 0 }}>
          <Box
            style={{
              width: 46,
              height: 46,
              borderRadius: 8,
              overflow: 'hidden',
              flexShrink: 0,
              background: 'rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {song?.thumbnail ? (
              <Image src={song.thumbnail} w={46} h={46} fit="cover" />
            ) : (
              <IconMusic size={20} color="rgba(255,255,255,0.4)" />
            )}
          </Box>
          <Box style={{ minWidth: 0 }}>
            <Text size="sm" fw={600} truncate>
              {song?.title ?? 'Radio wylaczone'}
            </Text>
            <Text size="xs" c="dimmed">
              {song ? 'Teraz odtwarzane' : 'Brak utworu'}
            </Text>
          </Box>
        </Group>
        <ActionIcon variant="subtle" color="gray" onClick={onClose}>
          <IconX size={16} />
        </ActionIcon>
      </Group>

      <Group justify="space-between" wrap="nowrap">
        <Group gap={6}>
          <ActionIcon variant="solid" disabled={!hasQueue} onClick={() => onControl('prev')}>
            <IconPlayerTrackPrev size={16} />
          </ActionIcon>
          <ActionIcon
            variant="solid"
            color="royal-purple"
            disabled={!song}
            onClick={() => onControl(playing ? 'pause' : 'resume')}
          >
            {playing ? <IconPlayerPause size={16} /> : <IconPlayerPlay size={16} />}
          </ActionIcon>
          <ActionIcon variant="solid" disabled={!hasQueue} onClick={() => onControl('next')}>
            <IconPlayerTrackNext size={16} />
          </ActionIcon>
          <ActionIcon variant="solid" color="red" disabled={!song} onClick={() => onControl('stop')}>
            <IconPlayerStop size={16} />
          </ActionIcon>
          <ActionIcon variant="solid" disabled={!canAddToPlaylist} onClick={onAddToPlaylist}>
            <IconPlaylistAdd size={16} />
          </ActionIcon>
        </Group>

        <Box style={{ width: 140 }}>
          <Slider
            size="xs"
            min={0}
            max={100}
            value={Math.round(volume * 100)}
            onChangeEnd={(value) => onVolume(value / 100)}
            label={null}
          />
        </Box>
      </Group>
    </Box>
  );
};

export default NowPlaying;
