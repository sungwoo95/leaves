import React from "react";
import { AppProvider } from "./AppContext"; // AppContext 가져오기
import Tree from "./Tree";

export default function App() {
  return (
    <AppProvider>
      <Tree />
    </AppProvider>
  );
}
