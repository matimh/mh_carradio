import type { ReactNode } from 'react';
import { Box } from '@mhdesign/core'; // JUST A MANTINE FORK, CHANGE TO MANTINE IF YOU WANT - WILL WORK 100% FINE.

interface Props {
  width?: number;
  height?: number;
  children: ReactNode;
}

const NuiFrame = ({ width = 880, height = 560, children }: Props) => {
  return (
    <Box
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        style={{
          width,
          height,
          maxWidth: '95vw',
          maxHeight: '95vh',
          borderRadius: 16,
          overflow: 'hidden',
          background: 'radial-gradient(circle at 15% -10%, #241a33 0%, #101113 55%, #0a0b0c 100%)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.55)',
          border: '1px solid rgba(111,178,144,0.25)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default NuiFrame;
