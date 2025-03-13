import { useEffect, useRef, useState } from "react";
import Button from "@mui/material/Button";
import { Box, Typography } from "@mui/material";
import Explorer from "./Explorer";
import { Directory, DirectoryType, MyForestInfo, UpdateName } from "../types";
import AddIcon from "@mui/icons-material/Add";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import axios from "axios";
import { path } from "../../config/env";

const PublicForest = ({ myForests }: { myForests: MyForestInfo }) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [directories, setDirectories] = useState<Directory[]>([]);
  const [forestName, setForestName] = useState<string>("");
  const { forestId, isOwner } = myForests;

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
    const newDirectories = (directories: Directory[]): Directory[] => {
      for (let i = 0; i < directories.length; i++) {
        const elem = directories[i];
        const children = elem.children;
        //여기서 찾았음, "새로운 배열"을 return하자.(나를 소환한 본체에게 전달)
        if (elem.id === targetId) {
          return [...directories.slice(0, i), { ...elem, children: [...children, directory] }, ...directories.slice(i + 1)];
        }
        if (children.length > 0) {
          //분신술 사용
          const updatedChildren = newDirectories(children);
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
        const result = newDirectories(prevDirectories);
        postDirectories(result);
        return result;
      } else {
        const result = [...prevDirectories, directory];
        postDirectories(result);
        return result;
      }
    });
  };

  const updateIsNew = (targetId: string): void => {
    const newDirectories = (directories: Directory[]): Directory[] => {
      for (let i = 0; i < directories.length; i++) {
        const elem = directories[i];
        const children = elem.children;
        if (elem.id === targetId) {
          return [...directories.slice(0, i), { ...elem, isNew: false }, ...directories.slice(i + 1)];
        }
        if (children.length > 0) {
          const updatedChildren = newDirectories(children);
          if (updatedChildren !== children) {
            return [...directories.slice(0, i), { ...elem, children: updatedChildren }, ...directories.slice(i + 1)];
          }
        }
      }
      return directories;
    };
    setDirectories((prevDirectories) => {
      const result = newDirectories(prevDirectories);
      postDirectories(result);
      return result;
    });
  };

  const updateName: UpdateName = (targetId: string, newName: string) => {
    const newDirectories = (directories: Directory[]): Directory[] => {
      for (let i = 0; i < directories.length; i++) {
        const elem: Directory = directories[i];
        const children: Directory[] = elem.children;
        if (elem.id === targetId) {
          return [...directories.slice(0, i), { ...elem, name: newName }, ...directories.slice(i + 1)];
        }
        if (children.length > 0) {
          const updatedChildren = newDirectories(children);
          if (updatedChildren !== children) {
            return [...directories.slice(0, i), { ...elem, children: updatedChildren }, ...directories.slice(i + 1)];
          }
        }
      }
      return directories;
    };
    setDirectories((prevDirectories) => {
      const result = newDirectories(prevDirectories);
      postDirectories(result);
      return result;
    });
  };

  const postDirectories = async (directories: Directory[]) => {
    try {
      await axios.post(`${path}/user/directories`, directories);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get(`${path}/forest/readForest/${forestId.toString()}`);
        const { directories, name } = response.data;
        console.log(response.data);
        setDirectories(directories);
        setForestName(name);
      } catch (error) {
        console.log(error);
      }
    };
    getData();
  }, []);

  return (
    <Box sx={{ width: "100%" }}>
      <Button variant="text" sx={{ pl: 2, width: "100%", justifyContent: "space-between" }} onClick={toggleVisibility}>
        <Box>{forestName}</Box>
        <Box sx={{ display: "flex" }}>
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
        </Box>
      </Button>
      {isVisible && ( // isVisible이 true일 때만 Box 렌더링
        <Explorer directories={directories} addDirectory={addDirectory} updateIsNew={updateIsNew} updateName={updateName} />
      )}
    </Box>
  );
};

export default PublicForest;
