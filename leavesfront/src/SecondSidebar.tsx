import { Paper, Box } from "@mui/material";
import Tree from "./Tree"; 

const SecondSidebar: React.FC = () => {
  return (
    <Paper sx={{ height: "100vh" }}>
      <Box sx={{ overflow: "hidden", height: "100vh" }}>
        <Tree />
      </Box>
    </Paper>
  );
};

export default SecondSidebar;