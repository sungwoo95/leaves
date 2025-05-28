import { Box, CircularProgress, useTheme } from '@mui/material';

const LoadingSpinner: React.FC = () => {
  const theme = useTheme();
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100%"
    >
      <CircularProgress
        sx={{ color: theme.palette.mode === 'dark' ? 'white' : 'black' }}
      />
    </Box>
  );
};

export default LoadingSpinner;
