export interface Song {
  title: string;
  url: string;
  thumbnail?: string;
}

export interface Playlist {
  id: number;
  name: string;
  songs: Song[];
}

export interface RadioState {
  queue: Song[];
  index: number;
  playing: boolean;
  volume: number;
}

export interface PanelData {
  playlists: Playlist[];
  radio: RadioState | null;
  maxPlaylists: number;
  maxSongsPerPlaylist: number;
  maxPlaylistNameLength: number;
}
