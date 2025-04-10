import { Paper, Box } from "@mui/material";
import Tree from "./Tree";
import { useTheme } from "@mui/material/styles";
import { useRef } from "react";

const SecondSidebar: React.FC = () => {
  const theme = useTheme();
  const containerRef = useRef<any>(null);
  return (
    <Paper
      sx={{
        height: "100%",
        width: "100%",
        bgcolor: theme.palette.mode === "dark" ? "black" : "white",
      }}>
      <Box ref={containerRef} sx={{ overflow: "hidden", height: "100%", width: "100%" }}>
        <Tree containerRef={containerRef} />
      </Box>
    </Paper>
  );
};

export default SecondSidebar;
