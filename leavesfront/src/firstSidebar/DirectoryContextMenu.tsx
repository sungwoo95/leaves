import { Menu, MenuItem } from "@mui/material";
import { OnClickMenuHandler, Position } from "../types";

const DirectoryContextMenu = ({
  open,
  menuPosition,
  onCloseHandler,
  onClickMenuHandler,
}: {
  open: boolean;
  menuPosition: Position | undefined;
  onCloseHandler: () => void;
  onClickMenuHandler: OnClickMenuHandler;
}) => {
  return (
    <Menu open={open} onClose={onCloseHandler} anchorReference="anchorPosition" anchorPosition={menuPosition} onClick={onClickMenuHandler}>
      <MenuItem>Rename</MenuItem>
      <MenuItem>Delete</MenuItem>
      <MenuItem>Properties</MenuItem>
    </Menu>
  );
};
export default DirectoryContextMenu;
