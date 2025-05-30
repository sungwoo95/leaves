import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      py={4}
      px={2}
      textAlign="center"
      sx={{
        color: '#777',
        fontSize: '0.875rem',
      }}
    >
      <Typography variant="body2" gutterBottom>
        Contact:{' '}
        <Link
          href="mailto:95ksw.dev@gmail.com"
          underline="hover"
          color="inherit"
        >
          95ksw.dev@gmail.com
        </Link>
      </Typography>
      <Typography variant="body2">
        © {new Date().getFullYear()} Namunibs. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;
