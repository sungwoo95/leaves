import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import { Box } from "@mui/material";
import Explorer from "./Explorer";
import { Directory, DirectoryType, UpdateName } from "../types";
import AddIcon from "@mui/icons-material/Add";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
const fileTree: Directory[] = [
  //임시 데이터.
  {
    id: "1",
    name: "Private Forest Documents",
    type: DirectoryType.FOLDER,
    children: [
      {
        id: "2",
        name: "resume.pdf",
        type: DirectoryType.FILE,
        children: [],
        isNew: false,
      },
      {
        id: "3",
        name: "notes.txt",
        type: DirectoryType.FILE,
        children: [],
        isNew: false,
      },
    ],
    isNew: false,
  },
  {
    id: "4",
    name: "Photos",
    type: DirectoryType.FOLDER,
    children: [
      {
        id: "5",
        name: "vacation.jpg",
        type: DirectoryType.FILE,
        children: [],
        isNew: false,
      },
      {
        id: "6",
        name: "Events",
        type: DirectoryType.FOLDER,
        children: [
          {
            id: "7",
            name: "birthday.jpg",
            type: DirectoryType.FILE,
            children: [],
            isNew: false,
          },
        ],
        isNew: false,
      },
    ],
    isNew: false,
  },
];
const PrivateForest = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [directories, setDirectories] = useState<Directory[]>(fileTree);

  const toggleVisibility = () => {
    setIsVisible((prev) => !prev);
  };

  const addDirectory = (targetId: null | string = null, type: DirectoryType): void => {
    const directory: Directory = {
      id: crypto.randomUUID(),
      type: type,
      isNew: true,
      name: "Untitled",
      children: [],
    };
    const updateChildren = (directories: Directory[]): Directory[] => {
      for (let i = 0; i < directories.length; i++) {
        const elem = directories[i];
        const children = elem.children;
        //여기서 찾았음, "새로운 배열"을 return하자.(나를 소환한 본체에게 전달)
        if (elem.id === targetId) {
          return [...directories.slice(0, i), { ...elem, children: [...children, directory] }, ...directories.slice(i + 1)];
        }
        if (children.length > 0) {
          //분신술 사용
          const updatedChildren = updateChildren(children);
          //나의 분신이 찾았을 경우, 나도 새로운 배열을 본체에게 전달.
          if (updatedChildren !== children) {
            return [...directories.slice(0, i), { ...elem, children: updatedChildren }, ...directories.slice(i + 1)];
          }
        }
      }
      return directories; //분신도 못 찾고, 나도 못 찾으면 그대로 반환.
    };
    setDirectories((prevDirectories) => {
      if (targetId) {
        return updateChildren(prevDirectories);
      } else {
        return [...prevDirectories, directory];
      }
    });
  };

  const updateIsNew = (targetId: string): void => {
    const updateDirectoryIsNew = (directories: Directory[]): Directory[] => {
      for (let i = 0; i < directories.length; i++) {
        const elem = directories[i];
        const children = elem.children;
        if (elem.id === targetId) {
          return [...directories.slice(0, i), { ...elem, isNew: false }, ...directories.slice(i + 1)];
        }
        if (children.length > 0) {
          const updatedChildren = updateDirectoryIsNew(children);
          if (updatedChildren !== children) {
            return [...directories.slice(0, i), { ...elem, children: updatedChildren }, ...directories.slice(i + 1)];
          }
        }
      }
      return directories;
    };
    setDirectories((prevDirectories) => {
      return updateDirectoryIsNew(prevDirectories);
    });
  };

  const updateName: UpdateName = (targetId: string, newName: string) => {
    const updateDirectoryName = (directories: Directory[]): Directory[] => {
      for (let i = 0; i < directories.length; i++) {
        const elem: Directory = directories[i];
        const children: Directory[] = elem.children;
        if (elem.id === targetId) {
          return [...directories.slice(0, i), { ...elem, name: newName }, ...directories.slice(i + 1)];
        }
        if (children.length > 0) {
          const updatedChildren = updateDirectoryName(children);
          if (updatedChildren !== children) {
            return [...directories.slice(0, i), { ...elem, children: updatedChildren }, ...directories.slice(i + 1)];
          }
        }
      }
      return directories;
    };
    setDirectories((prevDirectories) => {
      return updateDirectoryName(prevDirectories);
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
        <Explorer directories={directories} addDirectory={addDirectory} updateIsNew={updateIsNew} updateName={updateName} />
      )}
    </Box>
  );
};

export default PrivateForest;
