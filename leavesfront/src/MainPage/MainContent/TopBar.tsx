import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '@mui/material/styles';
import ParkIcon from '@mui/icons-material/Park';
import { useMainPageContext } from '../MainPageManager';
import { useEffect, useState } from 'react';
import UserAvatar from './UserAvatar';
import UserMenu from './UserMenu';

type Props = {
  toggleFirstSidebar: () => void;
  toggleSecondSidebar: () => void;
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
};

const TobBar: React.FC<Props> = ({
  toggleFirstSidebar,
  toggleSecondSidebar,
  title,
  setTitle,
}) => {
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const theme = useTheme();
  const mainPageContext = useMainPageContext();
  if (!mainPageContext) {
    return <p>mainPageContext.Provider의 하위 컴포넌트가 아님.</p>;
  }
  const { setTreeId, owningTreeId, leafId, user } = mainPageContext;

  const clickTitleHandler = () => {
    if (owningTreeId) setTreeId(owningTreeId);
  };

  const handleUserAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  useEffect(() => {
    if (!leafId) {
      setTitle('');
    }
  }, [leafId]);

  return (
    <div>
      <AppBar position="sticky" elevation={0}>
        <Toolbar
          sx={{
            minHeight: 40,
            '@media (min-width:600px)': {
              minHeight: 50,
            },
            bgcolor: theme.palette.mode === 'dark' ? '#121212' : 'white',
            justifyContent: 'space-between', // 좌측과 우측에 요소 배치
          }}
        >
          <div>
            <IconButton
              size="small"
              sx={{ mr: 1 }}
              onClick={toggleFirstSidebar}
            >
              <MenuIcon
                sx={{
                  color: theme.palette.mode === 'dark' ? 'white' : 'black',
                }}
              />
            </IconButton>
            <IconButton
              size="small"
              sx={{ mr: 1 }}
              onClick={toggleSecondSidebar}
            >
              <ParkIcon
                sx={{
                  color: theme.palette.mode === 'dark' ? 'white' : 'black',
                }}
              />
            </IconButton>
            <Button onClick={clickTitleHandler}>
              <Typography
                sx={{
                  color: theme.palette.mode === 'dark' ? 'white' : 'black',
                  maxWidth: '150px', // 최대 표시 너비
                  whiteSpace: 'nowrap', // 줄바꿈 방지
                  overflow: 'hidden', // 넘친 텍스트 숨김
                  textOverflow: 'ellipsis', // ...으로 표시
                }}
              >
                {title}
              </Typography>
            </Button>
          </div>
          <UserAvatar
            photoURL={user?.photoURL === null ? undefined : user?.photoURL}
            displayName={
              user?.displayName === null ? undefined : user?.displayName
            }
            onClick={handleUserAvatarClick}
          />
        </Toolbar>
      </AppBar>
      <UserMenu
        onClose={handleUserMenuClose}
        userMenuAnchorEl={userMenuAnchorEl}
      />
    </div>
  );
};

export default TobBar;
