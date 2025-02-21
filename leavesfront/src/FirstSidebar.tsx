import { Paper } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const FirstSidebar: React.FC = () => {
  const theme = useTheme();
  return (
    <Paper
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        bgcolor: theme.palette.mode === "dark" ? "#001000" : "white",
        color: theme.palette.mode === "dark" ? "white" : "black",
      }}>
      Sidebar Left
    </Paper>
  );
};

export default FirstSidebar;
