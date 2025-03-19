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

const Leaf: React.FC = () => {
  const theme = useTheme();
  const [title, setTitle] = useState<string>("");
  const editor = useCreateBlockNote();

  const mainPageContext = useMainPageContext();
  if (!mainPageContext) {
    return <p>mainPageContext.Provider의 하위 컴포넌트가 아님.</p>;
  }
  const { leafId, isPublicLeaf, ws } = mainPageContext;

  useEffect(() => {
    if (leafId) {
      if (isPublicLeaf && ws) {
        ws.send(JSON.stringify({ type: WsMessageType.JOIN_Leaf, data: { leafId } }));
      } else {
        //Rest Api
      }
    }
  }, [leafId]);
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
        <TextField value={title} fullWidth onChange={(e) => setTitle(e.target.value)} />
        <BlockNoteView editor={editor} data-theming-css-variables-demo />
      </Box>
    </Box>
  );
};

export default Leaf;
