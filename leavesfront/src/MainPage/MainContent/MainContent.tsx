import { Box, useTheme } from '@mui/material';
import Leaf from './Leaf';
import { Dispatch, SetStateAction } from 'react';

type MainContentProps = {
  title: string;
  setTitle: Dispatch<SetStateAction<string>>;
};

const MainContent = ({ title, setTitle }: MainContentProps) => {
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
