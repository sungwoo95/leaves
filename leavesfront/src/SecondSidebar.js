import React from "react";
import { Paper, Box } from "@mui/material";
import Tree from "./Tree";

export default function SidebarRight() {
  return (
    <Paper
      sx={{ height: "100vh"}}
    >
      <Box sx={{ overflow: "hidden" }}>
        <Tree />
      </Box>
    </Paper>
  );
}
