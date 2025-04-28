import { Box } from "@mui/material";
import Leaf from "./Leaf";
import TobBar from "./TopBar";

const MainContent: React.FC = () => {
  return (
    <Box>
      <TobBar />
      <Leaf />
    </Box>
  );
};

export default MainContent;
