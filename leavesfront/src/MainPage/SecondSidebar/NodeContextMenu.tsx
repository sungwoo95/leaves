import { Menu, MenuItem } from "@mui/material";
import { IsConquer, Position, WsMessageType } from "../../types";
import { useMainPageContext } from "../MainPageManager";

const NodeContextMenu = ({
  menuPosition,
  clickLeafId,
  isConquer,
  setMenuPosition,
}: {
  menuPosition: Position | null;
  clickLeafId: string | null;
  isConquer: IsConquer | undefined;
  setMenuPosition: any;
}) => {
  const mainPageContext = useMainPageContext();
  if (!mainPageContext) return <p>mainPageContext.Provider의 하위 컴포넌트가 아님</p>;
  const { ws, treeId } = mainPageContext;
  const handleConquerClick = () => {
    ws?.send(JSON.stringify({ type: WsMessageType.UPDATE_TREE_CONQUER, data: { treeId, leafId: clickLeafId, isConquer } }));
    handleClose();
  };
  const handleClose = () => {
    setMenuPosition(null);
  };
  return (
    <Menu open={!!menuPosition} anchorReference="anchorPosition" anchorPosition={menuPosition ? menuPosition : undefined} onClose={handleClose}>
      <MenuItem onClick={handleConquerClick}>Conquer</MenuItem>
    </Menu>
  );
};

export default NodeContextMenu;
