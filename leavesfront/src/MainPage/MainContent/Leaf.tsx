import { Box, TextField } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useEffect, useRef, useState } from "react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import "./editorStyles.css";
import { useMainPageContext } from "../MainPageManager";
import { WsMessageType } from "../../types";
import axios from "axios";
import { DEV_MODE, path } from "../../../config/config";
import { ClientSideSuspense, RoomProvider } from "@liveblocks/react";
import Editor from "./Editor";
import NoLeafIsOpen from "./NoLeafIsOpen";
import EditorFallback from "./EditorFallback";
import DevEditor from "./DevEditor";

const Leaf: React.FC = () => {
  const theme = useTheme();
  const [title, setTitle] = useState<string>("");
  const [owningTreeId, setOwningTreeId] = useState<string | undefined>(undefined);
  const [parentLeafId, setParentLeafId] = useState<string | null>(null);
  const prevLeafId = useRef<string | null>(null);
  const mainPageContext = useMainPageContext();
  if (!mainPageContext) {
    return <p>mainPageContext.Provider의 하위 컴포넌트가 아님.</p>;
  }
  const { leafId, ws } = mainPageContext;
  const wsMessageHandler: Record<string, (data: any) => void> = {
    [WsMessageType.UPDATE_LEAF_TITLE]: (data) => {
      const { title } = data;
      setTitle(title);
    },
    [WsMessageType.UPDATE_LEAF_PARENT]: (data) => {
      const { parentLeafId } = data;
      setParentLeafId(parentLeafId);
    },
  };

  const handleTitleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (ws) {
      ws.send(JSON.stringify({ type: WsMessageType.UPDATE_LEAF_TITLE, data: { owningTreeId, leafId, title: newTitle } }));
    }
  };

  const getLeafData = async () => {
    try {
      const response = await axios.get(`${path}/leaf/${leafId}`);
      const leaf = response.data;
      const { title, owningTreeId, parentLeafId } = leaf;
      setTitle(title);
      setOwningTreeId(owningTreeId);
      setParentLeafId(parentLeafId);
    } catch (error) {
      console.log("[Leaf]get leaf data error");
    }
  };

  const joinGroup = () => {
    if (ws && leafId) {
      ws.send(JSON.stringify({ type: WsMessageType.JOIN_GROUP, data: { groupId: leafId, prevGroupId: prevLeafId.current } }));
      prevLeafId.current = leafId;
    }
  };

  const handleMessage = (event: MessageEvent) => {
    const message = JSON.parse(event.data);
    const { type, data } = message;
    if (data.leafId !== leafId) return;
    if (wsMessageHandler[type]) {
      wsMessageHandler[type](data);
    }
  };

  const leaveGroup = (groupId: string) => {
    if (ws) {
      ws.send(JSON.stringify({ type: WsMessageType.LEAVE_GROUP, data: { groupId } }));
    }
  };

  useEffect(() => {
    if (leafId) {
      getLeafData();
      joinGroup();
      ws?.addEventListener("message", handleMessage);
    }
    //leafId가 string->null로 변경 시
    if (prevLeafId.current && !leafId) {
      leaveGroup(prevLeafId.current);
      prevLeafId.current = null;
    }
    return () => {
      ws?.removeEventListener("message", handleMessage);
    };
  }, [leafId, ws]);

  return (
    <Box
      sx={{
        height: "100%",
        boxSizing: "border-box",
        width: "100%",
      }}>
      {leafId && owningTreeId ? (
        <Box
          sx={{
            height: "100%",
            bgcolor: theme.palette.mode === "dark" ? "#121212" : "white",
            width: "100%",
            display: "flex",
            flexDirection: "column",
          }}>
          <TextField
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTitleChange(e)}
            variant="standard"
            InputProps={{
              disableUnderline: true,
            }}
            sx={{
              boxSizing: "border-box",
              width: "100%",
              paddingLeft: 7,
              paddingRight: 3,
              paddingTop: 2,
              paddingBottom: 1,
              input: {
                fontSize: "1.5rem",
                fontWeight: "bold",
              },
            }}
          />
          {DEV_MODE ? (
            <DevEditor parentLeafId={parentLeafId} owningTreeId={owningTreeId} />
          ) : (
            <RoomProvider id={`${leafId}`}>
              <ClientSideSuspense fallback={<EditorFallback />}>
                <Editor parentLeafId={parentLeafId} owningTreeId={owningTreeId} />
              </ClientSideSuspense>
            </RoomProvider>
          )}
        </Box>
      ) : (
        <NoLeafIsOpen />
      )}
    </Box>
  );
};

export default Leaf;
