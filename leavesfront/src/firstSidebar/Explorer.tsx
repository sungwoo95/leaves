import { AddDirectory, Directory } from "../types";
import { useState } from "react";
import { Box } from "@mui/material";
import DirectoryButton from "./DirectoryButton";

const Explorer = ({ directories, level = 2, addDirectory }: { directories: Directory[]; level?: number; addDirectory:AddDirectory }) => {
  const [openState, setOpenState] = useState<Record<string, boolean>>({});

  const toggleVisibility = (id: string) => {
    setOpenState((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  //directories가 []일 경우?
  //map은 순회를 하지 않는다.
  return (
    <Box sx={{ width: "100%" }}>
      {directories.map((item) => (
        <Box sx={{ width: "100%" }} key={item.id}>
          <DirectoryButton item={item} level={level} toggleVisibility={toggleVisibility} addDirectory={addDirectory} />
          {openState[item.id] && item.type === "folder" && item.children && <Explorer directories={item.children} level={level + 1} addDirectory={addDirectory} />}
        </Box>
      ))}
    </Box>
  );
};

export default Explorer;
