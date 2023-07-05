import Box from '@mui/material/Box';
import { purple } from '@mui/material/colors';
import Typography from '@mui/material/Typography';
import React from 'react';

const primary = purple[500]; // #f44336

export default function InternalServerError() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: primary,
      }}
    >
      <Typography variant="h1" style={{ color: 'white' }}>
        500
      </Typography>
    </Box>
  );
}
