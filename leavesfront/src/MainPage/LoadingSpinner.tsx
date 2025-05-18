import { Box, CircularProgress } from '@mui/material';

const LoadingSpinner: React.FC = () => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
    >
      <CircularProgress sx={{ color: '#89dc8c' }} />
    </Box>
  );
};

export default LoadingSpinner;
