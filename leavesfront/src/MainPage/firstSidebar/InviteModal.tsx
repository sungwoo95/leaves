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

type InviteModalProps = {
  open: boolean;
  onClose: () => void;
};

const InviteModal: React.FC<InviteModalProps> = ({ open, onClose }) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusColor, setStatusColor] = useState<'red' | 'green'>('red');
  const [loading, setLoading] = useState(false);
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

  const validateEmail = (value: string) => {
    const isValid = /^\S+@\S+\.\S+$/.test(value);
    setEmailError(isValid ? '' : '올바른 이메일 형식이 아닙니다.');
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
      const res = await axiosInstance.post('/api/invite', { email });

      setStatusMessage('초대가 완료되었습니다.');
      setStatusColor('green');
    } catch (error: any) {
      if (error.response?.status === 404) {
        setStatusMessage('존재하지 않는 유저입니다.');
        setStatusColor('red');
      } else if (error.response?.status === 409) {
        setStatusMessage('이미 초대된 유저입니다.');
        setStatusColor('red');
      } else {
        setStatusMessage('서버 오류가 발생했습니다.');
        setStatusColor('red');
      }
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
      <Box sx={style}>
        <Typography variant="h6" component="h2">
          Invite User
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
            취소
          </Button>
          <Button
            onClick={handleInvite}
            disabled={loading || !!emailError || !email}
            variant="contained"
          >
            초대
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default InviteModal;
