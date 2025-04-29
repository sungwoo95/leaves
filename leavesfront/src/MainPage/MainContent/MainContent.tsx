import { Box } from "@mui/material";
import Leaf from "./Leaf";
import TobBar from "./TopBar";

const MainContent = ({ toggleFirstSidebar, toggleSecondSidebar }: { toggleFirstSidebar: () => void; toggleSecondSidebar: () => void }) => {
  return (
    <Box sx={{ width: "100%", boxSizing: "border-box" }}>
      <TobBar toggleFirstSidebar={toggleFirstSidebar} toggleSecondSidebar={toggleSecondSidebar} />
      <Leaf />
    </Box>
  );
};

export default MainContent;
