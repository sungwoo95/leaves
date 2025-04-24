import { Paper } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ForestRegion from "./ForestRegion";

const FirstSidebar: React.FC = () => {
  const theme = useTheme();
  return (
    <Paper
      sx={{
        width: "100%",
        padding: 1,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        boxSizing: "border-box",
        bgcolor: theme.palette.mode === "dark" ? "#001000" : "white",
        color: theme.palette.mode === "dark" ? "white" : "black",
      }}>
      <ForestRegion />
    </Paper>
  );
};

export default FirstSidebar;
