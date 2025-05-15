import { Box, Typography, useTheme } from '@mui/material';

const NoTreeIsOpen = () => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        flex: 1,
        bgcolor: theme.palette.mode === 'dark' ? 'black' : 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      }}
    >
      <Typography variant="h6" color={theme.palette.text.primary}>
        No tree is open
      </Typography>
    </Box>
  );
};

export default NoTreeIsOpen;
