import { useEffect, useRef, useState } from 'react';
import Button from '@mui/material/Button';
import { Box, TextField, useTheme } from '@mui/material';
import Explorer from './Explorer';
import {
  Directory,
  DirectoryType,
  MyForestInfo,
  Position,
  updateForestDirectoriesData,
  UpdateName,
  WsMessageType,
} from '../../types';
import AddIcon from '@mui/icons-material/Add';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import { useMainPageContext } from '../MainPageManager';
import axiosInstance from '../../axiosInstance';
import ForestContextMenu from './ForestContextMenu';

const Forest = ({ myForests }: { myForests: MyForestInfo }) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [directories, setDirectories] = useState<Directory[]>([]);
  const [forestName, setForestName] = useState<string>('');
  const { forestId } = myForests;
  const theme = useTheme();
  const [menuPosition, setMenuPosition] = useState<Position | undefined>(
    undefined
  );
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | undefined>(undefined);
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
  const mainPageContext = useMainPageContext();
  if (!mainPageContext) {
    return <p>mainPageContext.Provider의 하위 컴포넌트가 아님.</p>;
  }
  const {
    ws,
    setTreeId,
    setOwningTreeId,
    setLeafId,
    user,
    setMyForests,
    setTreeForestId,
    setLeafForestId,
  } = mainPageContext;
  const wsMessageHandler: Record<string, (data: any) => void> = {
    [WsMessageType.UPDATE_FOREST_DIRECTORIES]: (data) => {
      const { directories, deleteTreeIds } = data;
      setDirectories(directories);
      if (deleteTreeIds) {
        for (const elem of deleteTreeIds) {
          changeLeafTreeDeleteTree(elem);
        }
      }
    },
    [WsMessageType.UPDATE_FOREST_NAME]: (data) => {
      const { newName } = data;
      setDirectories(newName);
    },
    [WsMessageType.DELETE_FOREST]: (data) => {
      const { forestId } = data;
      setMyForestsDeleteForest(forestId);
      changeLeafTreeDeleteForest(forestId);
    },
  };

  const toggleVisibility = () => {
    setIsVisible((prev) => !prev);
  };

  const addDirectory = (
    targetId: null | string = null,
    type: DirectoryType,
    treeId?: string
  ): void => {
    const directory: Directory = {
      id: crypto.randomUUID(),
      treeId,
      type: type,
      isNew: true,
      name: type === DirectoryType.FILE ? 'Untitled Tree' : 'Untitled Folder',
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
        postDirectories(result, null);
        return result;
      } else {
        const result = [...prevDirectories, directory];
        postDirectories(result, null);
        return result;
      }
    });
  };

  const deleteDirectory = (targetId: string, deleteTreeId?: string): void => {
    let deleteInfo: {
      deleteTreeId: string | null;
      deleteDirectories: Directory[] | null;
    } = {
      deleteTreeId: null,
      deleteDirectories: null,
    };
    if (deleteTreeId) {
      deleteInfo.deleteTreeId = deleteTreeId;
    }
    const newDirectories = (directories: Directory[]): Directory[] => {
      for (let i = 0; i < directories.length; i++) {
        const elem = directories[i];
        if (elem.id === targetId) {
          if (elem.type === DirectoryType.FOLDER) {
            deleteInfo.deleteDirectories = elem.children;
          }
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
      postDirectories(result, deleteInfo);
      return result;
    });
    if (deleteInfo) {
      const { deleteTreeId, deleteDirectories } = deleteInfo;
      if (deleteTreeId) changeLeafTreeDeleteTree(deleteTreeId);
      if (deleteDirectories) {
        const treeIds = treeIdsFromDirectories(deleteDirectories);
        for (const elem of treeIds) {
          changeLeafTreeDeleteTree(elem);
        }
      }
    }
  };
  const treeIdsFromDirectories = (directories: Directory[]): string[] => {
    const treeIds: string[] = [];
    const traverse = (dir: Directory) => {
      if (dir.type === DirectoryType.FILE && dir.treeId) {
        treeIds.push(dir.treeId);
      }
      for (const child of dir.children) {
        traverse(child);
      }
    };
    for (const directory of directories) {
      traverse(directory);
    }
    return treeIds; // 삭제 완료한 모든 treeId 반환
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
      postDirectories(result, null);
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
      postDirectories(result, null);
      return result;
    });
  };

  const postDirectories = async (
    directories: Directory[],
    deleteInfo: {
      deleteTreeId: string | null;
      deleteDirectories: Directory[] | null;
    } | null
  ) => {
    const data: updateForestDirectoriesData = {
      forestId,
      directories,
      deleteInfo,
    };
    if (ws) {
      ws.send(
        JSON.stringify({
          type: WsMessageType.UPDATE_FOREST_DIRECTORIES,
          data,
        })
      );
    }
  };

  const getForestData = async () => {
    try {
      const response = await axiosInstance.get(
        `/forest/readForest/${forestId.toString()}`
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
        })
      );
    } else if (retry < 100) {
      setTimeout(() => {
        joinGroup(retry + 1);
      }, 100);
    } else {
      console.error('[Forest][joinGroup]WebSocket not open after retries');
    }
  };

  const leaveGroup = () => {
    if (ws) {
      ws.send(
        JSON.stringify({
          type: WsMessageType.LEAVE_GROUP,
          data: { groupId: forestId },
        })
      );
    }
  };

  const onCloseHandler = () => {
    setMenuPosition(undefined);
  };

  const onClickMenuHandler = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const onClickRenameHandler = () => {
    setIsEditing(true);
    onCloseHandler();
  };

  const changeLeafTreeDeleteForest = (targetId: string) => {
    setTreeForestId((prev) => {
      if (prev === targetId) {
        setTreeId(null);
        return null;
      }
      return prev;
    });

    setLeafForestId((prev) => {
      if (prev === targetId) {
        setLeafId(null);
        return null;
      }
      return prev;
    });
  };

  const changeLeafTreeDeleteTree = (targetId: string) => {
    setTreeId((prev) => {
      if (prev === targetId) {
        return null;
      }
      return prev;
    });
    setOwningTreeId((prev) => {
      if (prev === targetId) {
        setLeafId(null);
        return prev;
      }
      return prev;
    });
  };

  const onClickDeleteHandler = () => {
    wsSendDeleteForest();
    setMyForestsDeleteForest(forestId);
    changeLeafTreeDeleteForest(forestId);
  };

  const setMyForestsDeleteForest = (targetId: string) => {
    setMyForests((prev) =>
      prev.filter((forest) => forest.forestId !== targetId)
    );
  };

  const onContextMenuHandler = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPosition({ top: e.clientY, left: e.clientX });
  };

  const updateForestName = (newName: string) => {
    if (ws) {
      ws.send(
        JSON.stringify({
          type: WsMessageType.UPDATE_FOREST_NAME,
          data: { forestId, newName },
        })
      );
    }
    setForestName(newName);
  };

  const exitEditMode = (): void => {
    if (inputRef.current) {
      const newName = inputRef.current.value;
      if (forestName !== newName) updateForestName(newName);
    }
    setIsEditing(false);
  };

  const wsSendDeleteForest = () => {
    if (!user || !ws) {
      alert('Delete failed');
      return;
    }
    const sub = user.uid;
    ws.send(
      JSON.stringify({
        type: WsMessageType.DELETE_FOREST,
        data: { forestId, sub },
      })
    );
  };

  useEffect(() => {
    getForestData();
    joinGroup(0);
    ws?.addEventListener('message', handleMessage);
    return () => {
      ws?.removeEventListener('message', handleMessage);
    };
  }, []);

  useEffect(() => {
    return () => {
      leaveGroup();
    };
  }, []);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  return (
    <Box>
      <Button
        disabled={isEditing || buttonDisabled}
        variant="text"
        sx={{
          pl: 2,
          width: '100%',
          justifyContent: 'space-between',
          color: theme.palette.mode === 'dark' ? 'white' : 'black',
          border: isEditing ? '2px solid green' : 'none',
        }}
        onClick={toggleVisibility}
        onContextMenu={onContextMenuHandler}
      >
        <ForestContextMenu
          open={!!menuPosition}
          menuPosition={menuPosition}
          onCloseHandler={onCloseHandler}
          onClickMenuHandler={onClickMenuHandler}
          onClickRenameHandler={onClickRenameHandler}
          onClickDeleteHandler={onClickDeleteHandler}
          forestId={forestId}
          forestName={forestName}
          setButtonDisabled={setButtonDisabled}
        />
        <Box
          sx={{
            width: '100%',
            textAlign: 'left',
            whiteSpace: 'nowrap', // 텍스트 줄바꿈 방지
            overflow: 'hidden', // 넘친 내용 숨김
            textOverflow: 'ellipsis', //...처리
          }}
        >
          {isEditing ? (
            <TextField
              inputRef={inputRef}
              defaultValue={forestName}
              variant="standard"
              onBlur={exitEditMode}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Escape') {
                  exitEditMode();
                }
              }}
            />
          ) : (
            `${forestName}`
          )}
        </Box>
        <Box sx={{ display: 'flex' }}>
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
              const response = await axiosInstance.post(`/tree/createTree`, {
                forestId,
              });
              const treeId: string = response.data.treeId;
              addDirectory(null, DirectoryType.FILE, treeId);
            }}
          />
        </Box>
      </Button>
      <Box sx={{ display: isVisible ? 'block' : 'none' }}>
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
