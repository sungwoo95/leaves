import { Box, TextField } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useEffect, useRef, useState } from "react";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import "./editorStyles.css";
import { useMainPageContext } from "../MainPageManager";
import { WsMessageType } from "../../types";
import axios from "axios";
import { path } from "../../../config/env";

const Leaf: React.FC = () => {
  const theme = useTheme();
  const [title, setTitle] = useState<string>("");
  const [contents, setContents] = useState<string>("");
  const owningTreeIdRef = useRef<string | undefined>(undefined);
  const prevLeafId = useRef<string | null>(null);
  const editor = useCreateBlockNote();
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
      console.log("[Leaf]handleTitleChange called");
      ws.send(JSON.stringify({ type: WsMessageType.UPDATE_LEAF_TITLE, data: { owningTreeId, leafId, title: newTitle } }));
    }
  };

  useEffect(() => {
    const getLeafData = async () => {
      try {
        const response = await axios.get(`${path}/leaf/${leafId}`);
        const leaf = response.data;
        const { title, contents } = leaf;
        setTitle(title);
        setContents(contents);
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

    const addWsEventListener = () => {
      if (ws) {
        ws.addEventListener("message", handleMessage);
      }
    };
    if (leafId) {
      getLeafData();
      joinLeafGroup();
      addWsEventListener();
    }
  }, [leafId, ws]);

  return (
    <Box
      sx={{
        height: "100vh",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}>
      <Box
        sx={{
          flex: 1,
          bgcolor: theme.palette.mode === "dark" ? "#121212" : "white",
        }}>
        <TextField value={title} fullWidth onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTitleChange(e)} />
        <BlockNoteView editor={editor} data-theming-css-variables-demo />
      </Box>
    </Box>
  );
};

export default Leaf;
