import { Button, Box, TextField } from "@mui/material";
import { AddDirectory, Directory, DirectoryType, UpdateIsNew } from "../types";
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
}: {
  item: Directory;
  level: number;
  isVisible: boolean;
  toggleVisibility: (id: string) => void;
  addDirectory: AddDirectory;
  updateIsNew: UpdateIsNew;
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
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
            inputRef={inputRef}
            defaultValue={item.name}
            variant="standard"
            onBlur={() => {
              if (item.isNew) updateIsNew(item.id);
              setIsEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (item.isNew) updateIsNew(item.id);
                setIsEditing(false);
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
