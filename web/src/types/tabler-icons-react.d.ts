declare module '@tabler/icons-react' {
  import type { FC, SVGProps } from 'react';

  export type IconProps = Omit<SVGProps<SVGSVGElement>, 'stroke'> & {
    size?: number | string;
    stroke?: number | string;
  };

  export const IconLink: FC<IconProps>;
  export const IconMusic: FC<IconProps>;
  export const IconPlayerPause: FC<IconProps>;
  export const IconPlayerPlay: FC<IconProps>;
  export const IconPlayerStop: FC<IconProps>;
  export const IconPlayerTrackNext: FC<IconProps>;
  export const IconPlayerTrackPrev: FC<IconProps>;
  export const IconPlaylist: FC<IconProps>;
  export const IconPlaylistAdd: FC<IconProps>;
  export const IconPlus: FC<IconProps>;
  export const IconTrash: FC<IconProps>;
  export const IconX: FC<IconProps>;
}
