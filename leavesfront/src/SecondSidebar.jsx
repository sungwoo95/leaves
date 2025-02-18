import React from "react";
import { Paper, Box } from "@mui/material";
import Tree from "./Tree.tsx";

export default function SecondSidebar() {
  return (
    <Paper
      sx={{ height: "100vh" }}
    >
      <Box sx={{ overflow: "hidden", height: "100vh" }}>
        <Tree />
      </Box>
    </Paper>
  );
}
