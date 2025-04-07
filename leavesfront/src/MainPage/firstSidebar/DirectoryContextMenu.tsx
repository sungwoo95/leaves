import { Menu, MenuItem } from "@mui/material";
import { OnClickMenuHandler, Position } from "../../types";

const DirectoryContextMenu = ({
  open,
  menuPosition,
  onCloseHandler,
  onClickMenuHandler,
  enterEditMode,
}: {
  open: boolean;
  menuPosition: Position | undefined;
  onCloseHandler: () => void;
  onClickMenuHandler: OnClickMenuHandler;
  enterEditMode: () => void;
}) => {
  const onClickRenameHandler = () => {
    enterEditMode();
    onCloseHandler();
  };
  return (
    <Menu open={open} onClose={onCloseHandler} anchorReference="anchorPosition" anchorPosition={menuPosition} onClick={onClickMenuHandler}>
      <MenuItem onClick={onClickRenameHandler}>Rename</MenuItem>
      <MenuItem>Delete</MenuItem>
      <MenuItem>Properties</MenuItem>
    </Menu>
  );
};
export default DirectoryContextMenu;
