import { Box, CircularProgress, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const EditorFallback = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        backgroundColor: isDark ? '#121212' : 'white',
        color: isDark ? '#ffffff' : '#000000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <CircularProgress color="inherit" />
      <Typography variant="body1" sx={{ mt: 2 }}>
        Loading content...
      </Typography>
    </Box>
  );
};

export default EditorFallback;
