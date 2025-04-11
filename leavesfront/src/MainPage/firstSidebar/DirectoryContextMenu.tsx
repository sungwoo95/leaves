import { Menu, MenuItem } from "@mui/material";
import { Position } from "../../types";

const DirectoryContextMenu = ({
  open,
  menuPosition,
  onCloseHandler,
  onClickRenameHandler,
  onClickDeleteHandler,
}: {
  open: boolean;
  menuPosition: Position | undefined;
  onCloseHandler: () => void;
  onClickRenameHandler: () => void;
  onClickDeleteHandler: () => void;
}) => {
  return (
    <Menu open={open} onClose={onCloseHandler} anchorReference="anchorPosition" anchorPosition={menuPosition}>
      <MenuItem onClick={onClickRenameHandler}>Rename</MenuItem>
      <MenuItem onClick={onClickDeleteHandler}>Delete</MenuItem>
      <MenuItem>Properties</MenuItem>
    </Menu>
  );
};
export default DirectoryContextMenu;
