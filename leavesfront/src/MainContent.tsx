import { Box, Paper } from "@mui/material";
import Editor from "./Editor";
import { useTheme } from "@mui/material/styles";

const MainContent: React.FC = () => {
  const theme = useTheme();

  return (
    <Box sx={{ height: "100vh", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
      <Box sx={{ mb: 2 }}>Title</Box>
      <Paper
        sx={{
          flex: 1,
          bgcolor: theme.palette.mode === "dark" ? "black" : "white",
        }}>
        <Editor />
      </Paper>
    </Box>
  );
};

export default MainContent;
