import { Menu, MenuItem } from "@mui/material";
import { Position } from "../types";

const DirectoryContextMenu = ({ open, menuPosition, onCloseHandler }: { open: boolean; menuPosition: Position | undefined; onCloseHandler: () => void }) => {
  return (
    <Menu open={open} onClose={onCloseHandler} anchorReference="anchorPosition" anchorPosition={menuPosition}>
      <MenuItem>Rename</MenuItem>
      <MenuItem>Delete</MenuItem>
      <MenuItem>Properties</MenuItem>
    </Menu>
  );
};
export default DirectoryContextMenu;
