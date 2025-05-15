import { Box } from '@mui/material';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import MainContent from './MainContent/MainContent';
import FirstSidebar from './firstSidebar/FirstSidebar';
import SecondSidebar from './SecondSidebar/SecondSidebar';
import '../../src/styles.css';
import { useRef, useState } from 'react';

const MainPageLayout: React.FC = () => {
  const prevFirstSidebarWidth = useRef<number>(240);
  const prevSecondSidebarWidth = useRef<number>(500);
  const [firstSidebarWidth, setFirstSidebarWidth] = useState<number>(240);
  const [secondSidebarWidth, setSecondSidebarWidth] = useState<number>(500);

  const toggleFirstSidebar = () => {
    if (firstSidebarWidth === 0) {
      setFirstSidebarWidth(prevFirstSidebarWidth.current);
    } else {
      setFirstSidebarWidth(0);
    }
  };
  const toggleSecondSidebar = () => {
    if (secondSidebarWidth === 0) {
      setSecondSidebarWidth(prevSecondSidebarWidth.current);
    } else {
      setSecondSidebarWidth(0);
    }
  };
  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* 첫 번째 사이드바 */}
      <ResizableBox
        width={firstSidebarWidth}
        height={Infinity}
        axis="x" //좌우 너비 조절
        resizeHandles={['e']} //핸들을 오른쪽에 위치(e: east)
        minConstraints={[100, Infinity]} //[너비,높이]
        maxConstraints={[400, Infinity]}
        handle={<span className="custom-handle" />}
        onResizeStop={(e: any, data: { size: { width: number } }) => {
          prevFirstSidebarWidth.current = data.size.width;
        }}
      >
        <Box
          sx={{
            display: firstSidebarWidth === 0 ? 'none' : 'block',
            height: '100%',
          }}
        >
          <FirstSidebar />
        </Box>
      </ResizableBox>

      {/* 두 번째 사이드바 */}
      <ResizableBox
        width={secondSidebarWidth}
        height={Infinity}
        axis="x"
        resizeHandles={['e']}
        minConstraints={[300, Infinity]}
        maxConstraints={[1000, Infinity]}
        handle={<span className="custom-handle" />}
        onResizeStop={(e: any, data: { size: { width: number } }) => {
          prevSecondSidebarWidth.current = data.size.width;
        }}
      >
        <SecondSidebar />
      </ResizableBox>

      {/* 메인 콘텐츠 */}
      <Box
        sx={{
          flex: 1, //flex-grow의 단축 형태로, 해당 요소가 남은 공간을 채우게 함.
          overflow: 'auto',
        }}
      >
        <MainContent
          toggleFirstSidebar={toggleFirstSidebar}
          toggleSecondSidebar={toggleSecondSidebar}
        />
      </Box>
    </Box>
  );
};

export default MainPageLayout;
