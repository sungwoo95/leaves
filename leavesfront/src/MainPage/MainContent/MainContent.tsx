import { Box, useTheme } from '@mui/material';
import Leaf from './Leaf';
import TobBar from './TopBar';
import { useState } from 'react';

const MainContent = ({
  toggleFirstSidebar,
  toggleSecondSidebar,
}: {
  toggleFirstSidebar: () => void;
  toggleSecondSidebar: () => void;
}) => {
  const [title, setTitle] = useState<string>('');
  const theme = useTheme();
  return (
    <Box
      sx={{
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <TobBar
        toggleFirstSidebar={toggleFirstSidebar}
        toggleSecondSidebar={toggleSecondSidebar}
        title={title}
        setTitle={setTitle}
      />
      <Box
        sx={{
          flex: 1,
          display: 'block',
          bgcolor: theme.palette.mode === 'dark' ? '#121212' : 'white',
        }}
      >
        <Leaf title={title} setTitle={setTitle} />
      </Box>
    </Box>
  );
};

export default MainContent;
