import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import { Box, Modal, TextField, Typography } from "@mui/material";
import axios from "axios";
import { path } from "../../config/env";
import PublicForest from "./PublicForest";
import AddIcon from "@mui/icons-material/Add";
import { MyForestInfo } from "../types";
import { useTheme } from "@mui/material/styles";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const PublicForestRegion = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [myForests, setMyForests] = useState<MyForestInfo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const theme = useTheme();
  const [inputValue, setInputValue] = useState("");
  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

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
            handleModalOpen();
          }}
        />
      </Button>
      <Modal open={isModalOpen} onClose={handleModalClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
        <Box sx={modalStyle}>
          <Typography color={theme.palette.mode === "dark" ? "white" : "black"} id="modal-modal-title" variant="h6" component="h2">
            Create Public Forest
          </Typography>
          <Typography color={theme.palette.mode === "dark" ? "white" : "black"} id="modal-modal-description" sx={{ mt: 2 }}>
            You can invite users to a public forest.
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            label="Enter the name of the new public forest."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            sx={{ mt: 2 }}
          />
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Button onClick={() => alert(`입력값: ${inputValue}`)} variant="contained">
              Create
            </Button>
          </Box>
        </Box>
      </Modal>
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
