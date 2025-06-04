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
  forestName,
  setButtonDisabled,
}: {
  open: boolean;
  menuPosition: Position | undefined;
  onCloseHandler: () => void;
  onClickMenuHandler: OnClickMenuHandler;
  onClickRenameHandler: () => void;
  onClickDeleteHandler: () => void;
  forestId: string;
  isOwner: boolean;
  forestName: string;
  setButtonDisabled: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const handleInviteClick = () => {
    onCloseHandler(); // 메뉴 먼저 닫고
    setInviteModalOpen(true); // 모달 열기
    setButtonDisabled(true); //모달에서 클릭 시 Forest버튼 ripple 방지.
  };

  const hanledCloseModal = () => {
    setInviteModalOpen(false);
    setButtonDisabled(false);
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
        {isOwner && (
          <div>
            <MenuItem onClick={onClickDeleteHandler}>Delete</MenuItem>
            <MenuItem onClick={handleInviteClick}>Add Member</MenuItem>
          </div>
        )}
      </Menu>
      <InviteModal
        open={inviteModalOpen}
        onClose={hanledCloseModal}
        forestId={forestId}
        forestName={forestName}
      />
    </>
  );
};

export default ForestContextMenu;
