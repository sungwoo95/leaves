import { Menu, MenuItem } from "@mui/material";
import { OnClickMenuHandler, Position } from "../../types";

const DirectoryContextMenu = ({
  open,
  menuPosition,
  onCloseHandler,
  onClickMenuHandler,
  onClickRenameHandler,
  onClickDeleteHandler,
}: {
  open: boolean;
  menuPosition: Position | undefined;
  onCloseHandler: () => void;
  onClickMenuHandler: OnClickMenuHandler;
  onClickRenameHandler: () => void;
  onClickDeleteHandler: () => void;
}) => {
  return (
    <Menu
      open={open}
      onClose={onCloseHandler}
      anchorReference="anchorPosition"
      anchorPosition={menuPosition}
      onClick={onClickMenuHandler}
    >
      <MenuItem onClick={onClickRenameHandler}>Rename</MenuItem>
      <MenuItem onClick={onClickDeleteHandler}>Delete</MenuItem>
      <MenuItem>Properties</MenuItem>
    </Menu>
  );
};
export default DirectoryContextMenu;
