import { Box } from "@mui/material";
import Leaf from "./Leaf";
import TobBar from "./TopBar";

const MainContent = ({ toggleFirstSidebar, toggleSecondSidebar }: { toggleFirstSidebar: () => void; toggleSecondSidebar: () => void }) => {
  return (
    <Box sx={{ width: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", height: "100%" }}>
      <TobBar toggleFirstSidebar={toggleFirstSidebar} toggleSecondSidebar={toggleSecondSidebar} />
      <Box sx={{ flex: 1, display:"block"}}>
        <Leaf />
      </Box>
    </Box>
  );
};

export default MainContent;
