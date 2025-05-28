import { Box } from '@mui/material';
import Tree from './Tree';
import { useTheme } from '@mui/material/styles';

const SecondSidebar: React.FC = () => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        height: '100vh',
        bgcolor: theme.palette.mode === 'dark' ? 'black' : 'white',
        borderRight:
          theme.palette.mode === 'dark'
            ? '1px solid #171817'
            : '1px solid rgb(200, 208, 200)',
      }}
    >
      <Box sx={{ overflow: 'hidden', height: '100vh' }}>
        <Tree />
      </Box>
    </Box>
  );
};

export default SecondSidebar;
