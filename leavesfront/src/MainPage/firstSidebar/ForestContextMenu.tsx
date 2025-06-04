import { Menu, MenuItem } from '@mui/material';
import { OnClickMenuHandler, Position } from '../../types';
import { useState } from 'react';
import InviteModal from './InviteModal';
import DeleteModal from './DeleteModal';

const ForestContextMenu = ({
  open,
  menuPosition,
  handleMenuClose,
  onClickMenuHandler,
  onClickRenameHandler,
  deleteForest,
  forestId,
  forestName,
  setButtonDisabled,
  menuClose,
}: {
  open: boolean;
  menuPosition: Position | undefined;
  handleMenuClose: () => void;
  onClickMenuHandler: OnClickMenuHandler;
  onClickRenameHandler: () => void;
  deleteForest: () => void;
  forestId: string;
  forestName: string;
  setButtonDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  menuClose: () => void;
}) => {
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const openInviteModal = () => {
    setInviteModalOpen(true); // 모달 열기
    setButtonDisabled(true); //모달에서 클릭 시 Forest버튼 ripple 방지.
  };

  const closeInviteModal = () => {
    setInviteModalOpen(false);
    setButtonDisabled(false);
  };

  const openDeleteModal = () => {
    setDeleteModalOpen(true);
    setButtonDisabled(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setButtonDisabled(false);
  };

  const handleInviteClick = () => {
    menuClose();
    openInviteModal();
  };

  const handleInviteModalClose = () => {
    closeInviteModal();
  };

  const handleDeleteClick = () => {
    menuClose();
    openDeleteModal();
  };

  const handleDeleteModalClose = () => {
    closeDeleteModal();
  };

  const handleModalDeleteClick = () => {
    deleteForest();
    closeDeleteModal();
  };

  return (
    <>
      <Menu
        open={open}
        onClose={handleMenuClose}
        anchorReference="anchorPosition"
        anchorPosition={menuPosition}
        onClick={onClickMenuHandler}
      >
        <MenuItem onClick={onClickRenameHandler}>Rename</MenuItem>
        <MenuItem onClick={handleDeleteClick}>Delete</MenuItem>
        <MenuItem onClick={handleInviteClick}>Add Member</MenuItem>
      </Menu>
      <InviteModal
        open={inviteModalOpen}
        onClose={handleInviteModalClose}
        forestId={forestId}
        forestName={forestName}
      />
      <DeleteModal
        open={deleteModalOpen}
        forestName={forestName}
        handleModalClose={handleDeleteModalClose}
        handleDeleteClick={handleModalDeleteClick}
      />
    </>
  );
};

export default ForestContextMenu;
