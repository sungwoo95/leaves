import { Box } from "@mui/material";
import Editor from "./Editor";
import { useTheme } from "@mui/material/styles";

const MainContent: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        height: "100vh",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}>
      <Box sx={{ mb: 2 }}>Title</Box>
      <Box         
        sx={{
          flex: 1,          
          bgcolor: theme.palette.mode === "dark" ? "#121212" : "white",
        }}>
        <Editor />
      </Box>
    </Box>
  );
};

export default MainContent;
