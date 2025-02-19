import { Box } from "@mui/material";
import Editor from "./Editor";

const MainContent: React.FC = () => {
  return (
    <Box sx={{ height: "100vh", p: 2 }}>
      Main Content
      <Editor/>
    </Box>
  )
};

export default MainContent;
