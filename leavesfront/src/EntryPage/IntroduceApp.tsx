import React from 'react';
import { Box, Typography } from '@mui/material';

const IntroduceApp: React.FC = () => {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 2,
        px: 2,
      }}
    >
      <Typography variant="h3" fontWeight="bold" gutterBottom>
        Grow the tree.
      </Typography>
      <Typography variant="h3" fontWeight="bold" gutterBottom>
        Burn the leaves.
      </Typography>
      <Typography variant="h5" color="text.secondary">
        Enjoy the journey of solving.
      </Typography>
    </Box>
  );
};

export default IntroduceApp;
