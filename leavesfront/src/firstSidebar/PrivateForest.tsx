import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import { Box } from "@mui/material";
import Explorer from "./Explorer";
import { Directory, DirectoryType } from "../types";
import AddIcon from "@mui/icons-material/Add";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
const fileTree: Directory[] = [
  //임시 데이터.
  {
    id: "1",
    name: "Private Forest Documents",
    type: DirectoryType.FOLDER,
    children: [
      { id: "2", name: "resume.pdf", type: DirectoryType.FILE,children:[] },
      { id: "3", name: "notes.txt", type: DirectoryType.FILE,children:[] }
    ],
  },
  {
    id: "4",
    name: "Photos",
    type: DirectoryType.FOLDER,
    children: [
      { id: "5", name: "vacation.jpg", type: DirectoryType.FILE,children:[] },
      {
        id: "6",
        name: "Events",
        type: DirectoryType.FOLDER,
        children: [{ id: "7", name: "birthday.jpg", type: DirectoryType.FILE,children:[]}],
      },
    ],
  },
];
const PrivateForest = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [directories, setDirectories] = useState<Directory[]>(fileTree);

  const toggleVisibility = () => {
    setIsVisible((prev) => !prev);
  };

  const addDirectory = (parentId: null | string = null, type: DirectoryType): void => {
    const directory: Directory = {
      id: crypto.randomUUID(),
      type: type,
      name: "Untitled",
      children: [],
    };
    const updateChildren = (directories: Directory[]): Directory[] => {
      for (let i = 0; i < directories.length; i++) {
        const id = directories[i].id;
        const children = directories[i].children;
        if (id === parentId) {
          //새로운 배열 반환.
          return [...directories.slice(0, i), { ...directories[i], children: [...children, directory] }, ...directories.slice(i + 1)];
        }
        //children이 있을 경우
        if (children.length > 0) {
          const updatedChildren = updateChildren(children);
          if (updatedChildren !== children) {
            //children에서 찾았을 경우
            return [...directories.slice(0, i), { ...directories[i], children: updatedChildren }, ...directories.slice(i + 1)];
          }
        }
      }
      return directories; //못 찾으면 그대로 반환.
    };
    setDirectories((prevDirectories) => {
      if (parentId) {
        return updateChildren(prevDirectories);
      } else {
        return [...prevDirectories, directory];
      }
    });
  };
  useEffect(() => {
    setDirectories(fileTree); //서버에서 받아오는 것으로 변경 예정.
  }, []);

  return (
    <Box sx={{ width: "100%" }}>
      <Button variant="text" sx={{ width: "100%", justifyContent: "flex-start" }} onClick={toggleVisibility}>
        Private Forest
        <CreateNewFolderIcon
          onClick={(e) => {
            e.stopPropagation();
            if (!isVisible) toggleVisibility();
            addDirectory(null, DirectoryType.FOLDER);
          }}
        />
        <AddIcon
          onClick={(e) => {
            e.stopPropagation();
            if (!isVisible) toggleVisibility();
            addDirectory(null, DirectoryType.FILE);
          }}
        />
      </Button>

      {isVisible && ( // isVisible이 true일 때만 Box 렌더링
        <Explorer directories={directories} addDirectory={addDirectory} />
      )}
    </Box>
  );
};

export default PrivateForest;
