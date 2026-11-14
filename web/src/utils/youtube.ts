const YOUTUBE_ID_PATTERNS = [
  /youtube\.com\/watch\?v=([\w-]{11})/,
  /youtube\.com\/shorts\/([\w-]{11})/,
  /youtu\.be\/([\w-]{11})/,
];

export function extractYoutubeId(url: string): string | null {
  for (const pattern of YOUTUBE_ID_PATTERNS) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

export function isYoutubeUrl(url: string): boolean {
  return extractYoutubeId(url) !== null;
}

export function youtubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export interface YoutubeMeta {
  title: string;
  thumbnail: string;
}

export async function fetchYoutubeMeta(url: string): Promise<YoutubeMeta | null> {
  const videoId = extractYoutubeId(url);
  if (!videoId) return null;

  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
    if (!res.ok) throw new Error('oembed failed');

    const data = await res.json();

    return {
      title: typeof data.title === 'string' ? data.title : 'Nieznany utwor',
      thumbnail: typeof data.thumbnail_url === 'string' ? data.thumbnail_url : youtubeThumbnail(videoId),
    };
  } catch {
    return {
      title: 'Nieznany utwor',
      thumbnail: youtubeThumbnail(videoId),
    };
  }
}
