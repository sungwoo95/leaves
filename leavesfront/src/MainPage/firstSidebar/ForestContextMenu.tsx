import { Menu, MenuItem } from '@mui/material';
import { OnClickMenuHandler, Position } from '../../types';
import { useState } from 'react';
import InviteModal from './InviteModal';

const ForestContextMenu = ({
  open,
  menuPosition,
  onCloseHandler,
  onClickMenuHandler,
  onClickRenameHandler,
  onClickDeleteHandler,
  forestId,
  isOwner,
}: {
  open: boolean;
  menuPosition: Position | undefined;
  onCloseHandler: () => void;
  onClickMenuHandler: OnClickMenuHandler;
  onClickRenameHandler: () => void;
  onClickDeleteHandler: () => void;
  forestId: string;
  isOwner: boolean;
}) => {
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const handleInviteClick = () => {
    onCloseHandler(); // 메뉴 먼저 닫고
    setInviteModalOpen(true); // 모달 열기
  };

  return (
    <>
      <Menu
        open={open}
        onClose={onCloseHandler}
        anchorReference="anchorPosition"
        anchorPosition={menuPosition}
        onClick={onClickMenuHandler}
      >
        <MenuItem onClick={onClickRenameHandler}>Rename</MenuItem>
        <MenuItem onClick={onClickDeleteHandler}>Delete</MenuItem>
        {isOwner && <MenuItem onClick={handleInviteClick}>Add Member</MenuItem>}
      </Menu>

      <InviteModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        forestId={forestId}
      />
    </>
  );
};

export default ForestContextMenu;
