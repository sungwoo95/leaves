import { Box, TextField } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
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
  const editor = useCreateBlockNote();
  const mainPageContext = useMainPageContext();
  if (!mainPageContext) {
    return <p>mainPageContext.Provider의 하위 컴포넌트가 아님.</p>;
  }
  const { leafId, isPublicLeaf, ws } = mainPageContext;

  const handleTitleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (isPublicLeaf && ws) {
      ws.send(JSON.stringify({ type: WsMessageType.UPDATE_LEAF_TITLE, data: { leafId, title: newTitle } }));
    }
  };

  useEffect(() => {
    const getLeafData = async () => {
      try {
        const response = await axios.get(`${path}/leaf/${leafId}`);
        const leaf = response.data;
        setTitle(leaf.title);
        setContents(leaf.contents);
      } catch (error) {
        console.log("[Leaf]get leaf data error");
      }
    };
    const joinLeafGroup = () => {
      if (ws) {
        ws.send(JSON.stringify({ type: WsMessageType.JOIN_LEAF, data: { leafId } }));
      }
    };
    const handleMessage = () => {
      if(ws){
        ws.onmessage = (event) => {
          const message = JSON.parse(event.data);
          const {type,data} = message;
          if (type === WsMessageType.UPDATE_LEAF_TITLE && data.leafId === leafId) {
            setTitle(data.title);
          }
        }
      }
    };

    if (leafId) {
      getLeafData();
      if (isPublicLeaf) {
        joinLeafGroup();
        handleMessage();
      }
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
