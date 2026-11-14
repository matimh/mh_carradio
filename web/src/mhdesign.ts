import { Button, mergeThemeOverrides, Modal, Tooltip, type MantineThemeOverride } from '@mhdesign/core'; // JUST A MANTINE FORK, CHANGE TO MANTINE IF YOU WANT - WILL WORK 100% FINE.
import './mhdesign.css';

const FONT = 'Plus Jakarta Sans, sans-serif';

const MH_DESIGN: MantineThemeOverride = {
  fontFamily: FONT,
  headings: { fontFamily: FONT, fontWeight: '700' },
  primaryShade: { light: 6, dark: 6 },
  defaultRadius: 'md',
  cursorType: 'pointer',
  components: {
    Button: Button.extend({ defaultProps: { variant: 'solid' } }),
    Tooltip: Tooltip.extend({ defaultProps: { withArrow: true, openDelay: 200 } }),
    Modal: Modal.extend({
      defaultProps: { centered: true, radius: 'lg', overlayProps: { backgroundOpacity: 0.6 } },
    }),
  },
};

export const mhTheme = (theme: MantineThemeOverride = {}) => mergeThemeOverrides(MH_DESIGN, theme);
