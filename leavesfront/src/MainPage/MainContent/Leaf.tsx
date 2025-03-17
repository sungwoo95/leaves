import { Box, TextField } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useState } from "react";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import "./editorStyles.css";

const Leaf: React.FC = () => {
  const theme = useTheme();
  const [title, setTitle] = useState<string>("");
  const editor = useCreateBlockNote();
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
