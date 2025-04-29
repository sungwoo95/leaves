import { Paper, Box } from "@mui/material";
import Tree from "./Tree"; 
import { useTheme } from "@mui/material/styles";

const SecondSidebar: React.FC = () => {
  const theme = useTheme();
  return (
    <Box sx={{ 
      height: "100vh", 
      bgcolor: theme.palette.mode === "dark" ? "black" : "white",
      }}>
      <Box sx={{ overflow: "hidden", height: "100vh" }}>
        <Tree />
      </Box>
    </Box>
  );
};

export default SecondSidebar;