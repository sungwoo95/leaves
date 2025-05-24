import { Button, Box, TextField, useTheme } from '@mui/material';
import {
  AddDirectory,
  DeleteDirectory,
  Directory,
  DirectoryType,
  Position,
  UpdateIsNew,
  UpdateName,
} from '../../types';
import AddIcon from '@mui/icons-material/Add';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import { useEffect, useRef, useState } from 'react';
import DirectoryContextMenu from './DirectoryContextMenu';
import { useMainPageContext } from '../MainPageManager';
import axiosInstance from '../../axiosInstance';

const DirectoryButton = ({
  isPublic,
  item,
  level,
  isVisible,
  toggleVisibility,
  addDirectory,
  updateIsNew,
  updateName,
  deleteDirectory,
}: {
  isPublic: boolean;
  item: Directory;
  level: number;
  isVisible: boolean;
  toggleVisibility: (id: string) => void;
  addDirectory: AddDirectory;
  updateIsNew: UpdateIsNew;
  updateName: UpdateName;
  deleteDirectory: DeleteDirectory;
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [menuPosition, setMenuPosition] = useState<Position | undefined>(
    undefined
  );
  const inputRef = useRef<HTMLInputElement | undefined>(undefined);
  const theme = useTheme();
  const mainPageContext = useMainPageContext();
  try {
    if (!mainPageContext) {
      //mainPageContext.Provider의 하위 컴포넌트가 아닐 경우
      throw new Error('//mainPageContext.Provider의 하위 컴포넌트가 아님');
    }
  } catch (err) {
    console.error((err as Error).message);
    return <p>오류가 발생했습니다.</p>;
  }
  const { setTreeId, setIsPublicTree } = mainPageContext;
  const exitEditMode = (): void => {
    console.log('[DirectoryButton]exitEditMode called');
    //편집 내용 업데이트.
    if (inputRef.current) {
      const newName = inputRef.current.value;
      if (item.name !== newName) updateName(item.id, newName);
    }
    //편집 상태 종료.
    if (item.isNew) updateIsNew(item.id);
    setIsEditing(false);
  };

  const onClickHandler = () => {
    console.log('[DirectoryButton][Button]onClick called');
    if (item.type === DirectoryType.FOLDER) toggleVisibility(item.id);
    if (item.type === DirectoryType.FILE) {
      setIsPublicTree(isPublic);
      if (item.treeId) setTreeId(item.treeId);
    }
  };

  const onClickMenuHandler = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const onContextMenuHandler = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPosition({ top: e.clientY, left: e.clientX });
  };

  const onCloseHandler = () => {
    console.log('[DirectoryButton]handleContextMenuClose called');
    setMenuPosition(undefined);
  };

  const enterEditMode = () => {
    setIsEditing(true);
  };

  const onClickRenameHandler = () => {
    enterEditMode();
    onCloseHandler();
  };

  const onClickDeleteHandler = () => {
    onCloseHandler();
    if (item.treeId) {
      deleteDirectory(item.id, item.treeId);
    } else {
      deleteDirectory(item.id);
    }
  };

  useEffect(() => {
    if ((item.isNew || isEditing) && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  return (
    <Button
      disabled={isEditing || item.isNew}
      variant="text"
      sx={{
        width: '100%',
        pl: level,
        border: item.isNew || isEditing ? '2px solid green' : 'none',
        justifyContent: 'space-between',
        color: theme.palette.mode === 'dark' ? 'white' : 'black',
      }}
      onClick={onClickHandler}
      onContextMenu={onContextMenuHandler}
    >
      <DirectoryContextMenu
        open={!!menuPosition}
        menuPosition={menuPosition}
        onCloseHandler={onCloseHandler}
        onClickMenuHandler={onClickMenuHandler}
        onClickRenameHandler={onClickRenameHandler}
        onClickDeleteHandler={onClickDeleteHandler}
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
        {item.isNew || isEditing ? (
          <TextField
            inputRef={inputRef} //focus,select를 위함.
            defaultValue={item.name}
            variant="standard"
            onBlur={exitEditMode}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === 'Escape') {
                exitEditMode();
              }
            }}
          />
        ) : (
          `${item.name}`
        )}
      </Box>
      {item.type === DirectoryType.FOLDER && (
        <Box sx={{ display: 'flex' }}>
          <CreateNewFolderIcon
            onClick={(e) => {
              e.stopPropagation();
              if (!isVisible) toggleVisibility(item.id);
              addDirectory(item.id, DirectoryType.FOLDER);
            }}
          />
          <AddIcon
            onClick={async (e) => {
              e.stopPropagation();
              if (!isVisible) toggleVisibility(item.id);
              //여기서 트리 생성 요청 보내고, 트리의 objectId받아서 addDirectory에 보내기.
              const response = await axiosInstance.post(`/tree/createTree`);
              const treeId: string = response.data.treeId;
              console.log('treeId: ', treeId); //ok
              addDirectory(item.id, DirectoryType.FILE, treeId);
            }}
          />
        </Box>
      )}
    </Button>
  );
};
export default DirectoryButton;
