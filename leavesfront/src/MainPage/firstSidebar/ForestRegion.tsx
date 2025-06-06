import { useState } from 'react';
import Button from '@mui/material/Button';
import { Box, Modal, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useTheme } from '@mui/material/styles';
import Forest from './Forest';
import axiosInstance from '../../axiosInstance';
import { useMainPageContext } from '../MainPageManager';

const modalStyle = {
  position: 'absolute',
  top: '30%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

const ForestRegion = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const theme = useTheme();
  const [inputValue, setInputValue] = useState('');
  const mainPageContext = useMainPageContext();
  if (!mainPageContext) {
    return <p>mainPageContext.Provider의 하위 컴포넌트가 아님.</p>;
  }
  const { myForests, setMyForests } = mainPageContext;
  const handleModalOpen = () => {
    setIsModalOpen(true);
  };
  const handleModalClose = () => {
    setIsModalOpen(false);
  };
  const toggleVisibility = () => {
    setIsVisible((prev) => !prev);
  };
  const postPublicForest = async () => {
    try {
      const response = await axiosInstance.post(`/forest/createForest`, {
        forestName: inputValue,
      });
      const newMyForestInfo = response.data.newMyForestInfo;
      console.log(newMyForestInfo);
      setMyForests((prev) => [...prev, newMyForestInfo]);
    } catch (error) {
      console.log('[PublicForestRegion]postPublicForest error');
    }
  };
  const handleModalCreate = () => {
    postPublicForest();
    handleModalClose();
    if (!isVisible) toggleVisibility();
  };

  return (
    <Box>
      <Button
        variant="text"
        sx={{
          width: '100%',
          justifyContent: 'space-between',
          color: theme.palette.mode === 'dark' ? 'white' : 'black',
        }}
        onClick={toggleVisibility}
      >
        <Box>Forest</Box>
        <Box sx={{ display: 'flex' }}>
          <AddIcon
            onClick={(e) => {
              e.stopPropagation();
              handleModalOpen();
            }}
          />
        </Box>
      </Button>
      <Modal
        open={isModalOpen}
        onClose={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography
            color={theme.palette.mode === 'dark' ? 'white' : 'black'}
            id="modal-modal-title"
            variant="h6"
            component="h2"
          >
            Create Forest
          </Typography>
          <Typography
            color={theme.palette.mode === 'dark' ? 'white' : 'black'}
            id="modal-modal-description"
            sx={{ mt: 2 }}
          >
            You can invite users to a forest.
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            label="Enter the name of the new forest."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            sx={{ mt: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button onClick={handleModalCreate} variant="contained">
              Create
            </Button>
          </Box>
        </Box>
      </Modal>
      <Box sx={{ display: isVisible ? 'block' : 'none' }}>
        {myForests.map((item) => (
          <Box key={item.forestId.toString()}>
            <Forest myForests={item} />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ForestRegion;
