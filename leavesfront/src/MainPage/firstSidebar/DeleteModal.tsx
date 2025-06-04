import React from 'react';
import { Modal, Box, Button, Typography, useTheme } from '@mui/material';

type DeleteModalProps = {
  open: boolean;
  forestName: string;
  handleModalClose: () => void;
  handleDeleteClick: () => void;
};

const DeleteModal: React.FC<DeleteModalProps> = ({
  open,
  forestName,
  handleModalClose,
  handleDeleteClick,
}) => {
  const theme = useTheme();
  const style = {
    position: 'absolute',
    top: '30%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
    color: theme.palette.mode === 'dark' ? 'white' : 'black',
  };

  return (
    <Modal open={open} onClose={handleModalClose}>
      <Box
        sx={style}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <Typography variant="h6" component="h2">
          {`Are you sure about deleting ${forestName}?`}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button onClick={handleModalClose} sx={{ mr: 1 }}>
            Close
          </Button>
          <Button onClick={handleDeleteClick} variant="contained">
            Delete
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default DeleteModal;
