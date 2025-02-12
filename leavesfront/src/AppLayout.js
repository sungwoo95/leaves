import React from "react";
import { Box } from "@mui/material";
import FirstSidebar from "./FirstSidebar";
import SecondSidebar from "./SecondSidebar";
import MainContent from "./MainContent";

export default function AppLayout() {
  return (
    <Box sx={{ display: "flex" }}>
      <Box sx={{ flex: 2 }}>
        <FirstSidebar />
      </Box>
      <Box sx={{ flex: 3 }}>
        <SecondSidebar />
      </Box>
      <Box sx={{ flex: 5 }}>
        <MainContent />
      </Box>
    </Box>
  );
}
