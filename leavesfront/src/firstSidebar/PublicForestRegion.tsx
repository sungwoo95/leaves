import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import { Box } from "@mui/material";
import axios from "axios";
import { path } from "../../config/env";
import PublicForest from "./PublicForest";
import AddIcon from "@mui/icons-material/Add";
import { MyForestInfo } from "../types";

const PublicForestRegion = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [myForests, setMyForests] = useState<MyForestInfo[]>([]);
  const toggleVisibility = () => {
    setIsVisible((prev) => !prev);
  };

  useEffect(() => {
    console.log("[PublicForestRegion]useEffect called");
    const setMyForestsData = async () => {
      try {
        const response = await axios.get(`${path}/user/myForests`);
        if (Array.isArray(response.data)) {
          const newMyForests: MyForestInfo[] = response.data;
          setMyForests(newMyForests);
        }
      } catch (error) {
        console.log(error);
      }
    };
    setMyForestsData();
  }, []);

  return (
    <Box sx={{ borderRadius: 2 }}>
      <Button variant="text" sx={{ width: "100%", justifyContent: "flex-start" }} onClick={toggleVisibility}>
        Public Forest
        <AddIcon
          onClick={(e) => {
            e.stopPropagation();
            if (!isVisible) toggleVisibility();
            //클릭 시 모달 생성.
          }}
        />
      </Button>
      {isVisible && (
        <Box>
          {myForests.map((item) => (
            <Box sx={{ width: "100%" }} key={item.forestId.toString()}>
              <PublicForest forestMetaData={item} />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default PublicForestRegion;
