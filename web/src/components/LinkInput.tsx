import { useState } from 'react';
import { ActionIcon, Box, Loader, TextInput } from '@mhdesign/core'; // JUST A MANTINE FORK, CHANGE TO MANTINE IF YOU WANT - WILL WORK 100% FINE.
import { IconLink, IconPlayerPlay } from '@tabler/icons-react';
import { fetchYoutubeMeta, isYoutubeUrl } from '../utils/youtube';
import type { Song } from '../types/carradio';

interface PlayResponse {
  ok: boolean;
  message?: string;
}

interface Props {
  onPlay: (song: Song) => Promise<PlayResponse>;
}

const LinkInput = ({ onPlay }: Props) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const trimmed = url.trim();
    if (!trimmed || loading) return;

    if (!isYoutubeUrl(trimmed)) {
      setError('To nie wyglada na link YouTube.');
      return;
    }

    setLoading(true);
    setError(null);

    const meta = await fetchYoutubeMeta(trimmed);
    const response = await onPlay({
      title: meta?.title ?? 'Nieznany utwor',
      url: trimmed,
      thumbnail: meta?.thumbnail,
    });

    setLoading(false);

    if (response.ok) {
      setUrl('');
    } else {
      setError(response.message ?? 'Nie udalo sie odtworzyc utworu.');
    }
  };

  return (
    <Box p={16} style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <TextInput
        placeholder="Wklej link z YouTube..."
        value={url}
        onChange={(event) => {
          setUrl(event.currentTarget.value);
          setError(null);
        }}
        onKeyDown={(event) => event.key === 'Enter' && submit()}
        leftSection={<IconLink size={16} />}
        rightSection={
          loading ? (
            <Loader size="xs" />
          ) : (
            <ActionIcon variant="subtle" disabled={!url.trim()} onClick={submit}>
              <IconPlayerPlay size={14} />
            </ActionIcon>
          )
        }
        error={error}
      />
    </Box>
  );
};

export default LinkInput;
