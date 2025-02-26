import { Directory } from "../types";
import { useState } from "react";
import { Button, Box } from "@mui/material";

const Explorer = ({ directories, level = 2 }: { directories: Directory[]; level?: number }) => {
  const [openState, setOpenState] = useState<Record<string, boolean>>({});

  const toggleVisibility = (id: string) => {
    setOpenState((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Box sx={{ width: "100%" }}>
      {directories.map((item) => (
        <Box sx={{ width: "100%" }} key={item._id}>
          <Button
            variant="text"
            sx={{
              width: "100%",
              pl: level,
            }}
            onClick={()=>toggleVisibility(item._id)}>
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
          </Button>
          {openState[item._id] && item.type === "folder" && item.children && <Explorer directories={item.children} level={level + 1} />}
        </Box>
      ))}
    </Box>
  );
};

export default Explorer;
