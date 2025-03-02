import { AddDirectory, Directory, UpdateIsNew } from "../types";
import { useState } from "react";
import { Box } from "@mui/material";
import DirectoryButton from "./DirectoryButton";

const Explorer = ({
  directories,
  level = 2,
  addDirectory,
  updateIsNew
}: {
  directories: Directory[];
  level?: number;
  addDirectory: AddDirectory;
  updateIsNew: UpdateIsNew;
}) => {
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
          <DirectoryButton item={item} level={level} isVisible={openState[item.id]} toggleVisibility={toggleVisibility} addDirectory={addDirectory} updateIsNew={updateIsNew}/>
          {openState[item.id] && item.type === "folder" && item.children && (
            <Explorer directories={item.children} level={level + 1} addDirectory={addDirectory} updateIsNew={updateIsNew} />
          )}
        </Box>
      ))}
    </Box>
  );
};

export default Explorer;
