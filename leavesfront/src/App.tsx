import AppLayout from "./AppLayout";
import { Space } from "./Space";
import useMediaQuery from "@mui/material/useMediaQuery";
import { ThemeProvider, createTheme} from "@mui/material/styles";

const App: React.FC = () => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
    const theme = createTheme({
      palette: {
        mode: prefersDarkMode ? "dark" : "light",
      },
    });
  return (
    <ThemeProvider theme = {theme}>
      <Space>
        <AppLayout />
      </Space>
    </ThemeProvider>
  );
};

export default App;
