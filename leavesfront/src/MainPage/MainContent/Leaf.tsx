import { Box, TextField } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useEffect, useRef, useState } from "react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import "./editorStyles.css";
import { useMainPageContext } from "../MainPageManager";
import { WsMessageType } from "../../types";
import axios from "axios";
import { path } from "../../../config/env";
import { ClientSideSuspense, RoomProvider } from "@liveblocks/react";
import { Editor } from "./Editor";

const Leaf: React.FC = () => {
  const theme = useTheme();
  const [title, setTitle] = useState<string>("");
  const owningTreeIdRef = useRef<string | undefined>(undefined);
  const prevLeafId = useRef<string | null>(null);
  const mainPageContext = useMainPageContext();
  if (!mainPageContext) {
    return <p>mainPageContext.Provider의 하위 컴포넌트가 아님.</p>;
  }
  const { leafId, ws } = mainPageContext;

  const handleTitleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    const owningTreeId = owningTreeIdRef.current;
    setTitle(newTitle);
    if (ws) {
      ws.send(JSON.stringify({ type: WsMessageType.UPDATE_LEAF_TITLE, data: { owningTreeId, leafId, title: newTitle } }));
    }
  };

  useEffect(() => {
    const getLeafData = async () => {
      try {
        const response = await axios.get(`${path}/leaf/${leafId}`);
        const leaf = response.data;
        const { title } = leaf;
        setTitle(title);
        owningTreeIdRef.current = leaf.owningTreeId;
      } catch (error) {
        console.log("[Leaf]get leaf data error");
      }
    };
    const joinLeafGroup = () => {
      if (ws && leafId) {
        ws.send(JSON.stringify({ type: WsMessageType.JOIN_LEAF, data: { leafId, prevLeafId: prevLeafId.current } }));
        prevLeafId.current = leafId;
      }
    };
    const handleMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      const { type, data } = message;
      if (type === WsMessageType.UPDATE_LEAF_TITLE && data.leafId === leafId) {
        setTitle(data.title);
      }
    };
    if (leafId) {
      getLeafData();
      joinLeafGroup();
      ws?.addEventListener("message", handleMessage);
    }
    return () => {
      ws?.removeEventListener("message", handleMessage);
    };
  }, [leafId, ws]);

  return (
    <Box
      sx={{
        height: "100vh",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}>
      {leafId ? (
        <Box
          sx={{
            flex: 1,
            bgcolor: theme.palette.mode === "dark" ? "#121212" : "white",
          }}>
          <TextField value={title} fullWidth onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTitleChange(e)} />
          <RoomProvider id={`${leafId}`}>
            <ClientSideSuspense fallback={<div>Loading…</div>}>
              <Editor />
            </ClientSideSuspense>
          </RoomProvider>
        </Box>
      ) : (
        <p>no leaf is open</p>
      )}
    </Box>
  );
};

export default Leaf;
