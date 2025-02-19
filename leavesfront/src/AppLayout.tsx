import { Box } from "@mui/material";
import FirstSidebar from "./FirstSidebar";
import SecondSidebar from "./SecondSidebar";
import MainContent from "./MainContent";

const AppLayout: React.FC = () => {
  return (
    <Box sx={{ display: "flex", height: "100vh" }}>  
      <Box sx={{ flex: 1.5, display: "flex", flexDirection: "column" }}>  
        <FirstSidebar />
      </Box>
      <Box sx={{ flex: 3.5, display: "flex", flexDirection: "column" }}>  
        <SecondSidebar />
      </Box>
      <Box sx={{ flex: 5, display: "flex", flexDirection: "column" }}>  
        <MainContent />
      </Box>
    </Box>
  );
};

export default AppLayout;