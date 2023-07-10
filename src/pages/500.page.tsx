import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import React from 'react';

export default function InternalServerError() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#B6C9FF',
      }}
    >
      <Typography variant="h1" style={{ color: 'white' }}>
        500
      </Typography>
    </Box>
  );
}
