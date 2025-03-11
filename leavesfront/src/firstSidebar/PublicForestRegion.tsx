import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import { Box } from "@mui/material";
import axios from "axios";
import { ForestMetaData } from "../types";
import { path } from "../../config/env";
import PublicForest from "./PublicForest";

const PublicForestRegion = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [forests, setForests] = useState<ForestMetaData[]>([]);
  const toggleVisibility = () => {
    setIsVisible((prev) => !prev);
  };

  useEffect(() => {
    console.log("[PublicForestRegion]useEffect called");
    const setForestsData = async () => {
      try {
        const response = await axios.get(`${path}/user/forests`);
        const newForests: ForestMetaData[] = response.data;
        setForests(newForests);
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
