import React, { useState } from 'react';
import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  useTheme,
} from '@mui/material';
import axiosInstance from '../../axiosInstance';
import { useMainPageContext } from '../MainPageManager';

type InviteModalProps = {
  open: boolean;
  onClose: () => void;
  forestId: string;
  forestName: string;
};

const InviteModal: React.FC<InviteModalProps> = ({
  open,
  onClose,
  forestId,
  forestName,
}) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusColor, setStatusColor] = useState<'red' | 'green'>('red');
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const mainPageContext = useMainPageContext();
  if (!mainPageContext) {
    return <p>mainPageContext.Provider의 하위 컴포넌트가 아님.</p>;
  }
  const { user } = mainPageContext;
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

  const validateEmail = (value: string) => {
    let isValid = /^\S+@\S+\.\S+$/.test(value);
    if (value === user!.email) isValid = false; //자기 초대 방지.
    setEmailError(isValid ? '' : 'The email format is invalid.');
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setStatusMessage('');
    validateEmail(value);
  };

  const handleInvite = async () => {
    if (!validateEmail(email)) return;

    setLoading(true);
    try {
      await axiosInstance.post('/forest/addMemberToForest', {
        email,
        forestId,
      });
      setStatusMessage('초대가 완료되었습니다.');
      setStatusColor('green');
    } catch (error: any) {
      setStatusColor('red');
      setStatusMessage(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setEmailError('');
    setStatusMessage('');
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={style}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <Typography variant="h6" component="h2">
          {`Add member to ${forestName}`}
        </Typography>

        <TextField
          fullWidth
          label="Email"
          variant="outlined"
          value={email}
          onChange={handleChange}
          error={!!emailError}
          helperText={emailError}
          sx={{ mt: 2 }}
        />

        {statusMessage && (
          <Typography sx={{ mt: 2, color: statusColor }}>
            {statusMessage}
          </Typography>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button onClick={handleClose} disabled={loading} sx={{ mr: 1 }}>
            Close
          </Button>
          <Button
            onClick={handleInvite}
            disabled={loading || !!emailError || !email}
            variant="contained"
          >
            Invite
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default InviteModal;
