import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import { useTheme } from "@mui/material/styles";
import ParkIcon from "@mui/icons-material/Park";
import { Box } from "@mui/material";

const TobBar = () => {
  const theme = useTheme();
  return (
    <AppBar position="sticky">
      <Toolbar
        sx={{
          minHeight: 40,
          "@media (min-width:600px)": {
            minHeight: 50,
          },
          bgcolor: theme.palette.mode === "dark" ? "#121212" : "white",
          justifyContent: "space-between", // 좌측과 우측에 요소 배치
        }}>
        <div>
          <IconButton size="small" sx={{ mr: 1 }}>
            <MenuIcon sx={{ color: theme.palette.mode === "dark" ? "white" : "black" }} />
          </IconButton>
          <IconButton size="small" sx={{ mr: 1 }}>
            <ParkIcon sx={{ color: theme.palette.mode === "dark" ? "white" : "black" }} />
          </IconButton>
          <Button>
            <Typography sx={{ color: theme.palette.mode === "dark" ? "white" : "black" }}>제목 버튼(todo)</Typography>
          </Button>
        </div>
        <div>
          <IconButton size="small" sx={{ mr: 1 }}>
            유저 (todo)
          </IconButton>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default TobBar;
