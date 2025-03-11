import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import { Box } from "@mui/material";
import axios from "axios";
import { ForestMetaData } from "../types";
import { path } from "../../config/env";
import PublicForest from "./PublicForest";
import AddIcon from "@mui/icons-material/Add";

const PublicForestRegion = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [forests, setForests] = useState<ForestMetaData[]>([]);
  const toggleVisibility = () => {
    setIsVisible((prev) => !prev);
  };
  const postForest = async () => {
    try {
      const response = await axios.post(`${path}/forest/createForest`);
      const forestMetaData = response.data.forestMetaData;
      setForests((prev)=>{
        return [...prev,forestMetaData];
      })
    } catch (error) {}
  };

  useEffect(() => {
    console.log("[PublicForestRegion]useEffect called");
    const setForestsData = async () => {
      try {
        const response = await axios.get(`${path}/user/forests`);
        if (Array.isArray(response.data)) {
          const newForests: ForestMetaData[] = response.data;
          setForests(newForests);
        }
      } catch (error) {
        console.log(error);
      }
    };
    setForestsData();
  }, []);

  return (
    <Box sx={{ borderRadius: 2 }}>
      <Button variant="text" sx={{ width: "100%", justifyContent: "flex-start" }} onClick={toggleVisibility}>
        Public Forest
        <AddIcon
          onClick={(e) => {
            e.stopPropagation();
            if (!isVisible) toggleVisibility();
            postForest();
          }}
        />
      </Button>
      {isVisible && (
        <Box>
          {forests.map((item) => (
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
