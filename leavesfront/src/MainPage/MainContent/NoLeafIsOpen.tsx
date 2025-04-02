import { Box, Typography, useTheme } from "@mui/material";

const NoLeafIsOpen = () => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        flex: 1,
        bgcolor: theme.palette.mode === "dark" ? "#121212" : "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}>
      <Typography variant="h6" color={theme.palette.text.primary}>
        No leaf is open
      </Typography>
    </Box>
  );
};

export default NoLeafIsOpen;
