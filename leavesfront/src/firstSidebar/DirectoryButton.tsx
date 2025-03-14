import { Button, Box, TextField } from "@mui/material";
import { AddDirectory, Directory, DirectoryType, Position, UpdateIsNew, UpdateName } from "../types";
import AddIcon from "@mui/icons-material/Add";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import { useEffect, useRef, useState } from "react";
import DirectoryContextMenu from "./DirectoryContextMenu";
import { path } from "../../config/env";
import axios from "axios";

const DirectoryButton = ({
  item,
  level,
  isVisible,
  toggleVisibility,
  addDirectory,
  updateIsNew,
  updateName,
}: {
  item: Directory;
  level: number;
  isVisible: boolean;
  toggleVisibility: (id: string) => void;
  addDirectory: AddDirectory;
  updateIsNew: UpdateIsNew;
  updateName: UpdateName;
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [menuPosition, setMenuPosition] = useState<Position | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement | undefined>(undefined);

  const exitEditMode = (): void => {
    console.log("[DirectoryButton]exitEditMode called");
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
    console.log("[DirectoryButton][Button]onClick called");
    if (item.type === DirectoryType.FOLDER) toggleVisibility(item.id);
    if (item.type === DirectoryType.FILE){
      console.log("[onClickHandler]treeId: ",item.treeId);
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
    console.log("[DirectoryButton]handleContextMenuClose called");
    setMenuPosition(undefined);
  };

  useEffect(() => {
    if ((item.isNew || isEditing) && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  return (
    <Button
      variant="text"
      sx={{
        width: "100%",
        pl: level,
        border: item.isNew || isEditing ? "2px solid green" : "none",
        justifyContent: "space-between",
      }}
      onClick={onClickHandler}
      onContextMenu={onContextMenuHandler}>
      <DirectoryContextMenu open={!!menuPosition} menuPosition={menuPosition} onCloseHandler={onCloseHandler} onClickMenuHandler={onClickMenuHandler} />
      <Box
        sx={{
          width: "100%",
          textAlign: "left",
          whiteSpace: "nowrap", // 텍스트 줄바꿈 방지
          overflow: "hidden", // 넘친 내용 숨김
          textOverflow: "ellipsis", //...처리
        }}>
        {item.isNew || isEditing ? (
          <TextField
            inputRef={inputRef} //focus,select를 위함.
            defaultValue={item.name}
            variant="standard"
            onBlur={exitEditMode}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                exitEditMode();
              }
            }}
          />
        ) : (
          `${item.type === "folder" ? "📁" : "📄"} ${item.name}`
        )}
      </Box>
      {item.type === DirectoryType.FOLDER && (
        <Box sx={{ display: "flex" }}>
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
              const response = await axios.post(`${path}/tree/createTree`);
              const treeId: string = response.data.treeId;
              console.log("treeId: ", treeId); //ok
              addDirectory(item.id, DirectoryType.FILE, treeId);
            }}
          />
        </Box>
      )}
    </Button>
  );
};
export default DirectoryButton;
