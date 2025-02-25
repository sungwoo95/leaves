import { Paper } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import PrivateForest from "./firstSidebar/PrivateForest";
import PublicForest from "./firstSidebar/PublicForest";

const FirstSidebar: React.FC = () => {
  const theme = useTheme();
  return (
    <Paper
      sx={{
        padding: 1,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        gap:2,
        boxSizing: "border-box",
        bgcolor: theme.palette.mode === "dark" ? "#001000" : "white",
        color: theme.palette.mode === "dark" ? "white" : "black",
      }}>
      Sidebar Left
      <PrivateForest/>
      <PublicForest/>
    </Paper>
  );
};

export default FirstSidebar;
