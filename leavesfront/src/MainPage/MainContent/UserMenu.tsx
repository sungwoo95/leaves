import { Menu, MenuItem } from '@mui/material';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../axiosInstance';

type Props = {
  onClose: () => void;
  userMenuAnchorEl: null | HTMLElement;
};

const UserMenu: React.FC<Props> = ({ onClose, userMenuAnchorEl }) => {
  const navigate = useNavigate();
  const handleLogoutClick = async () => {
    onClose();
    try {
      await signOut(auth);
      // 로그아웃 후 리다이렉트
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };
  const handleDeleteAccountClick = async () => {
    onClose();
    try {
      await axiosInstance.delete('user/deleteUser');
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <Menu
      anchorEl={userMenuAnchorEl}
      open={!!userMenuAnchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <MenuItem onClick={handleLogoutClick}>Logout</MenuItem>
      <MenuItem onClick={handleDeleteAccountClick}>Delete Account</MenuItem>
    </Menu>
  );
};

export default UserMenu;
