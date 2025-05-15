import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import { Box, useTheme } from "@mui/material";
import Explorer from "./Explorer";
import {
  Directory,
  DirectoryType,
  MyForestInfo,
  UpdateName,
  WsMessageType,
} from "../../types";
import AddIcon from "@mui/icons-material/Add";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import { useMainPageContext } from "../MainPageManager";
import axiosInstance from "../../axiosInstance";

const Forest = ({ myForests }: { myForests: MyForestInfo }) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [directories, setDirectories] = useState<Directory[]>([]);
  const [forestName, setForestName] = useState<string>("");
  const { forestId, isOwner } = myForests;
  const theme = useTheme();
  const mainPageContext = useMainPageContext();
  if (!mainPageContext) {
    return <p>mainPageContext.Provider의 하위 컴포넌트가 아님.</p>;
  }
  const { ws, treeId, setTreeId } = mainPageContext;
  const wsMessageHandler: Record<string, (data: any) => void> = {
    [WsMessageType.UPDATE_FOREST_DIRECTORIES]: (data) => {
      const { directories } = data;
      setDirectories(directories);
    },
  };

  const toggleVisibility = () => {
    setIsVisible((prev) => !prev);
  };

  const addDirectory = (
    targetId: null | string = null,
    type: DirectoryType,
    treeId?: string,
  ): void => {
    const directory: Directory = {
      id: crypto.randomUUID(),
      treeId,
      type: type,
      isNew: true,
      name: type === DirectoryType.FILE ? "Untitled Tree" : "Untitled Folder",
      children: [],
    };
    const newDirectories = (directories: Directory[]): Directory[] => {
      for (let i = 0; i < directories.length; i++) {
        const elem = directories[i];
        const children = elem.children;
        //여기서 찾았음, "새로운 배열"을 return하자.(나를 소환한 본체에게 전달)
        if (elem.id === targetId) {
          return [
            ...directories.slice(0, i),
            { ...elem, children: [...children, directory] },
            ...directories.slice(i + 1),
          ];
        }
        if (children.length > 0) {
          //분신술 사용
          const updatedChildren = newDirectories(children);
          //나의 분신이 찾았을 경우, 나도 새로운 배열을 본체에게 전달.
          if (updatedChildren !== children) {
            return [
              ...directories.slice(0, i),
              { ...elem, children: updatedChildren },
              ...directories.slice(i + 1),
            ];
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

  const deleteDirectory = (targetId: string, targetTreeId?: string): void => {
    const newDirectories = (directories: Directory[]): Directory[] => {
      for (let i = 0; i < directories.length; i++) {
        const elem = directories[i];
        if (elem.id === targetId) {
          //targetId 찾았을 경우 새로운 Directory[]반환.
          return [...directories.slice(0, i), ...directories.slice(i + 1)];
        }
        if (elem.children.length > 0) {
          const updatedChildren = newDirectories(elem.children);
          //새로운 Directory[]반환 시, 새로운 Directory[]반환.
          if (updatedChildren !== elem.children) {
            return [
              ...directories.slice(0, i),
              { ...elem, children: updatedChildren },
              ...directories.slice(i + 1),
            ];
          }
        }
      }
      return directories; // 못 찾았으면 그대로 반환
    };
    setDirectories((prevDirectories) => {
      const result = newDirectories(prevDirectories);
      postDirectories(result);
      return result;
    });
    if (targetTreeId === treeId) {
      setTreeId(null);
    }
  };

  const updateIsNew = (targetId: string): void => {
    const newDirectories = (directories: Directory[]): Directory[] => {
      for (let i = 0; i < directories.length; i++) {
        const elem = directories[i];
        const children = elem.children;
        if (elem.id === targetId) {
          return [
            ...directories.slice(0, i),
            { ...elem, isNew: false },
            ...directories.slice(i + 1),
          ];
        }
        if (children.length > 0) {
          const updatedChildren = newDirectories(children);
          if (updatedChildren !== children) {
            return [
              ...directories.slice(0, i),
              { ...elem, children: updatedChildren },
              ...directories.slice(i + 1),
            ];
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
          return [
            ...directories.slice(0, i),
            { ...elem, name: newName },
            ...directories.slice(i + 1),
          ];
        }
        if (children.length > 0) {
          const updatedChildren = newDirectories(children);
          if (updatedChildren !== children) {
            return [
              ...directories.slice(0, i),
              { ...elem, children: updatedChildren },
              ...directories.slice(i + 1),
            ];
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
    if (ws) {
      ws.send(
        JSON.stringify({
          type: WsMessageType.UPDATE_FOREST_DIRECTORIES,
          data: { forestId, directories },
        }),
      );
    }
  };

  const getForestData = async () => {
    try {
      const response = await axiosInstance.get(
        `/forest/readForest/${forestId.toString()}`,
      );
      const { directories, name } = response.data;
      console.log(response.data);
      setDirectories(directories);
      setForestName(name);
    } catch (error) {
      console.log(error);
    }
  };

  const handleMessage = (event: MessageEvent) => {
    const message = JSON.parse(event.data);
    const { type, data } = message;
    if (data.forestId !== forestId) return;
    if (wsMessageHandler[type]) {
      wsMessageHandler[type](data);
    }
  };

  const joinGroup = (retry: number) => {
    if (ws && forestId && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: WsMessageType.JOIN_GROUP,
          data: { groupId: forestId, prevGroupId: null },
        }),
      );
    } else if (retry < 100) {
      setTimeout(() => {
        joinGroup(retry + 1);
      }, 100);
    } else {
      console.error("[Forest][joinGroup]WebSocket not open after retries");
    }
  };

  const leaveGroup = () => {
    if (ws) {
      ws.send(
        JSON.stringify({
          type: WsMessageType.LEAVE_GROUP,
          data: { groupId: forestId },
        }),
      );
    }
  };

  useEffect(() => {
    getForestData();
    joinGroup(0);
    ws?.addEventListener("message", handleMessage);
    return () => {
      ws?.removeEventListener("message", handleMessage);
    };
  }, []);

  useEffect(() => {
    return () => {
      leaveGroup();
    };
  }, []);

  return (
    <Box>
      <Button
        variant="text"
        sx={{
          pl: 2,
          width: "100%",
          justifyContent: "space-between",
          color: theme.palette.mode === "dark" ? "white" : "black",
        }}
        onClick={toggleVisibility}
      >
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
            onClick={async (e) => {
              e.stopPropagation();
              if (!isVisible) toggleVisibility();
              const response = await axiosInstance.post(`/tree/createTree`);
              const treeId: string = response.data.treeId;
              addDirectory(null, DirectoryType.FILE, treeId);
            }}
          />
        </Box>
      </Button>
      <Box sx={{ display: isVisible ? "block" : "none" }}>
        <Explorer
          isPublic={true}
          directories={directories}
          addDirectory={addDirectory}
          updateIsNew={updateIsNew}
          updateName={updateName}
          deleteDirectory={deleteDirectory}
        />
      </Box>
    </Box>
  );
};

export default Forest;
