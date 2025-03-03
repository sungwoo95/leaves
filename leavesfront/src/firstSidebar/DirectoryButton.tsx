import { Button, Box, TextField } from "@mui/material";
import { AddDirectory, Directory, DirectoryType, UpdateIsNew, UpdateName } from "../types";
import AddIcon from "@mui/icons-material/Add";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import { useEffect, useRef, useState } from "react";

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
  const inputRef = useRef<HTMLInputElement | undefined>(undefined);
  
  const handleEditingEnd = ():void => {
    //편집 내용 업데이트.
    if (inputRef.current) {
      const newName = inputRef.current.value;
      if (item.name !== newName) updateName(item.id, newName); 
    }
    //편집 상태 종료.
    if (item.isNew) updateIsNew(item.id);
    setIsEditing(false);
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
      }}
      onClick={() => toggleVisibility(item.id)}>
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
            onBlur={() => {
              handleEditingEnd();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleEditingEnd();
              }
            }}
          />
        ) : (
          `${item.type === "folder" ? "📁" : "📄"} ${item.name}`
        )}
      </Box>
      {item.type === DirectoryType.FOLDER && (
        <>
          <CreateNewFolderIcon
            onClick={(e) => {
              e.stopPropagation();
              if (!isVisible) toggleVisibility(item.id);
              addDirectory(item.id, DirectoryType.FOLDER);
            }}
          />
          <AddIcon
            onClick={(e) => {
              e.stopPropagation();
              if (!isVisible) toggleVisibility(item.id);
              addDirectory(item.id, DirectoryType.FILE);
            }}
          />
        </>
      )}
    </Button>
  );
};
export default DirectoryButton;
