import { AddDirectory, Directory, UpdateIsNew, UpdateName } from "../../types";
import { useState } from "react";
import { Box } from "@mui/material";
import DirectoryButton from "./DirectoryButton";

const Explorer = ({
  isPublic,
  directories,
  level = 2,
  addDirectory,
  updateIsNew,
  updateName,
}: {
  isPublic: boolean;
  directories: Directory[];
  level?: number;
  addDirectory: AddDirectory;
  updateIsNew: UpdateIsNew;
  updateName: UpdateName;
}) => {
  const [openState, setOpenState] = useState<Record<string, boolean>>({});

  const toggleVisibility = (id: string) => {
    setOpenState((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  return (
    <Box sx={{ width: "100%" }}>
      {directories.map((item) => (
        <Box sx={{ width: "100%" }} key={item.id}>
          <DirectoryButton
            isPublic={isPublic}
            item={item}
            level={level}
            isVisible={openState[item.id]}
            toggleVisibility={toggleVisibility}
            addDirectory={addDirectory}
            updateIsNew={updateIsNew}
            updateName={updateName}
          />
          {openState[item.id] && item.type === "folder" && item.children && (
            <Explorer
              isPublic={isPublic}
              directories={item.children}
              level={level + 1}
              addDirectory={addDirectory}
              updateIsNew={updateIsNew}
              updateName={updateName}
            />
          )}
        </Box>
      ))}
    </Box>
  );
};

export default Explorer;
