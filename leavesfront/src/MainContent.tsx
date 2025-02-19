import { Box } from "@mui/material";
import Editor from "./Editor";

const MainContent: React.FC = () => {
  return (
    <Box sx={{ height: "100vh", p: 2, boxSizing: "border-box" }}>
      Main Content
      <Editor />
    </Box>
  );
};

export default MainContent;
