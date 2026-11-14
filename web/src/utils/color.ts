import type { MantineColorsTuple } from '@mhdesign/core'; // JUST A MANTINE FORK, CHANGE TO MANTINE IF YOU WANT - WILL WORK 100% FINE.

export const DEFAULT_BRAND = '#067a3f';

type Rgb = [number, number, number];

const clamp = (value: number) => Math.min(255, Math.max(0, Math.round(value)));

export const hexToRgb = (hex: string): Rgb => {
  let value = hex.trim().replace('#', '');

  if (value.length === 3) {
    value = value
      .split('')
      .map((char) => char + char)
      .join('');
  }

  const parsed = /^[0-9a-fA-F]{6}$/.test(value) ? value : DEFAULT_BRAND.slice(1);

  return [
    parseInt(parsed.slice(0, 2), 16),
    parseInt(parsed.slice(2, 4), 16),
    parseInt(parsed.slice(4, 6), 16),
  ];
};

export const rgbToHex = ([r, g, b]: Rgb) =>
  `#${[r, g, b].map((channel) => clamp(channel).toString(16).padStart(2, '0')).join('')}`;

export const mix = (from: string, to: string, amount: number) => {
  const a = hexToRgb(from);
  const b = hexToRgb(to);

  return rgbToHex([
    a[0] + (b[0] - a[0]) * amount,
    a[1] + (b[1] - a[1]) * amount,
    a[2] + (b[2] - a[2]) * amount,
  ]);
};

export const buildScale = (base: string): MantineColorsTuple => [
  mix(base, '#ffffff', 0.94),
  mix(base, '#ffffff', 0.84),
  mix(base, '#ffffff', 0.68),
  mix(base, '#ffffff', 0.54),
  mix(base, '#ffffff', 0.42),
  mix(base, '#ffffff', 0.16),
  base,
  mix(base, '#000000', 0.14),
  mix(base, '#000000', 0.3),
  mix(base, '#000000', 0.46),
];

export const deriveAccent = (base: string) => mix(base, '#ffffff', 0.42);
