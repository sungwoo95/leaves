import { useState } from "react";
import Button from "@mui/material/Button";
import { Box } from "@mui/material";
import Explorer from "./Explorer";
import { Directory } from "../types";

const PrivateForest = () => {
  const [isVisible, setIsVisible] = useState(false); 

  const toggleVisibility = () => {
    setIsVisible((prev) => !prev); 
  };
  
  const fileTree: Directory[] = [
    {
      _id: "1",
      name: "Private Forest Documents",
      type: "folder",
      children: [
        { _id: "2", name: "resume.pdf", type: "file" },
        { _id: "3", name: "notes.txt", type: "file" },
      ],
    },
    {
      _id: "4",
      name: "Photos",
      type: "folder",
      children: [
        { _id: "5", name: "vacation.jpg", type: "file" },
        {
          _id: "6",
          name: "Events",
          type: "folder",
          children: [{ _id: "7", name: "birthday.jpg", type: "file" }],
        },
      ],
    },
  ];


  return (
    <Box sx={{width:"100%"}}>
      <Button
        variant="text"
        sx={{ width: "100%", justifyContent: "flex-start" }}
        onClick={toggleVisibility} 
      >
        Private Forest
      </Button>

      {isVisible && ( // isVisible이 true일 때만 Box 렌더링
        <Explorer directories={fileTree}/>
      )}
    </Box>
  );
};

export default PrivateForest;
