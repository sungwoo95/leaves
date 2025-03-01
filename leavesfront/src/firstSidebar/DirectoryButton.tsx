import { Button, Box } from "@mui/material";
import { AddDirectory, Directory, DirectoryType } from "../types";
import AddIcon from "@mui/icons-material/Add";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";

const DirectoryButton = ({
  item,
  level,
  toggleVisibility,
  addDirectory,
}: {
  item: Directory;
  level: number;
  toggleVisibility: (id: string) => void;
  addDirectory: AddDirectory;
}) => {
  return (
    <Button
      variant="text"
      sx={{
        width: "100%",
        pl: level,
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
        {item.type === "folder" ? "📁 " : "📄 "} {item.name}
      </Box>
      {item.type === DirectoryType.FOLDER && (
        <>
          <CreateNewFolderIcon
            onClick={(e) => {
              e.stopPropagation();
              addDirectory(item.id, DirectoryType.FOLDER);
            }}
          />
          <AddIcon
            onClick={(e) => {
              e.stopPropagation();
              addDirectory(item.id, DirectoryType.FILE);
            }}
          />
        </>
      )}
    </Button>
  );
};
export default DirectoryButton;
