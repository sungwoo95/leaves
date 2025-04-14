import { Paper, Box } from "@mui/material";
import Tree from "./Tree";
import { useTheme } from "@mui/material/styles";

const SecondSidebar: React.FC = () => {
  const theme = useTheme();
  return (
    <Paper
      sx={{
        height: "100vh",
        bgcolor: theme.palette.mode === "dark" ? "black" : "white",
      }}>
      <Box style={{ width: "100%", height: "100%" }}>
        <Tree />
      </Box>
    </Paper>
  );
};

export default SecondSidebar;
