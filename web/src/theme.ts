import { buildScale } from './utils/color';
import { mhTheme } from './mhdesign';

export const createCarradioTheme = (mainColor: string) =>
  mhTheme({
    primaryColor: 'royal-purple',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    defaultRadius: 'md',
    colors: {
      'royal-purple': buildScale(mainColor),
    },
  });
