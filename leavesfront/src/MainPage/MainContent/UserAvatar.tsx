import React, { useState, useEffect } from 'react';
import { Avatar, IconButton } from '@mui/material';

type UserAvatarProps = {
  photoURL?: string;
  displayName?: string;
  onClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
};

const UserAvatar: React.FC<UserAvatarProps> = ({
  photoURL,
  displayName,
  onClick,
  onContextMenu,
}) => {
  const [imgSrc, setImgSrc] = useState(photoURL);

  useEffect(() => {
    setImgSrc(photoURL); // photoURL이 변경될 때 반영
  }, [photoURL]);

  return (
    <IconButton onClick={onClick} onContextMenu={onContextMenu} sx={{ p: 0 }}>
      <Avatar
        src={imgSrc}
        alt={displayName}
        onError={() => {
          console.warn('[UserAvatar] Image load failed:', imgSrc);
          setImgSrc(undefined); //이미지 로드 에러 시 imgSrc undefined설정하여 fallback전환을 위함
        }}
        sx={{ width: 40, height: 40 }}
      ></Avatar>
    </IconButton>
  );
};

export default UserAvatar;
