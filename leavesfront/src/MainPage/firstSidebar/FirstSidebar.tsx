import { Box, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ForestRegion from './ForestRegion';

const FirstSidebar: React.FC = () => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        width: '100%',
        padding: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        bgcolor: theme.palette.mode === 'dark' ? '#171817' : 'white',
        overflow: 'auto',
        borderRight:
          theme.palette.mode === 'dark'
            ? '1px solid #171817'
            : '1px solid rgb(200, 208, 200)',
      }}
    >
      <ForestRegion />
    </Box>
  );
};

export default FirstSidebar;
