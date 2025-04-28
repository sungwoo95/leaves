import { Box } from "@mui/material";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import MainContent from "./MainContent/MainContent";
import FirstSidebar from "./firstSidebar/FirstSidebar";
import SecondSidebar from "./SecondSidebar/SecondSidebar";
import "../../src/styles.css";

const MainPageLayout: React.FC = () => {
  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* 첫 번째 사이드바 */}
      <ResizableBox
        width={240}
        height={Infinity}
        axis="x" //좌우 너비 조절
        resizeHandles={["e"]} //핸들을 오른쪽에 위치(e: east)
        minConstraints={[100, Infinity]} //[너비,높이]
        maxConstraints={[400, Infinity]}
        handle={<span className="custom-handle" />}>
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <FirstSidebar />
        </Box>
      </ResizableBox>

      {/* 두 번째 사이드바 */}
      <ResizableBox
        width={500}
        height={Infinity}
        axis="x"
        resizeHandles={["e"]}
        minConstraints={[300, Infinity]}
        maxConstraints={[1000, Infinity]}
        handle={<span className="custom-handle" />}>
        <Box sx={{ height: "100%" }}>
          <SecondSidebar />
        </Box>
      </ResizableBox>

      {/* 메인 콘텐츠 */}
      <Box
        sx={{
          flex: 1, //flex-grow의 단축 형태로, 해당 요소가 남은 공간을 채우게 함.
          minWidth: 0,
          overflow: "auto",
        }}>
        <MainContent />
      </Box>
    </Box>
  );
};

export default MainPageLayout;
