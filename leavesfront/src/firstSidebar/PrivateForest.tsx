import { useState } from "react";
import Button from "@mui/material/Button";
import { Box } from "@mui/material";

const PrivateForest = () => {
  const [isVisible, setIsVisible] = useState(false); 

  const toggleVisibility = () => {
    setIsVisible((prev) => !prev); 
  };

  return (
    <Box sx={{ borderRadius: 2 }}>
      <Button
        variant="text"
        sx={{ width: "100%", justifyContent: "flex-start" }}
        onClick={toggleVisibility} 
      >
        Private Forest
      </Button>

      {isVisible && ( // isVisible이 true일 때만 Box 렌더링
        <Box>visible or invisible</Box>
      )}
    </Box>
  );
};

export default PrivateForest;
