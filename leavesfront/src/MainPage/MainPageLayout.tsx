import { Box } from '@mui/material';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import MainContent from './MainContent/MainContent';
import FirstSidebar from './firstSidebar/FirstSidebar';
import SecondSidebar from './SecondSidebar/SecondSidebar';
import '../../src/styles.css';
import { useEffect, useRef, useState } from 'react';
import { useMediaQuery } from '@mui/material';
import TobBar from './MainContent/TopBar';
const screenWidth = window.innerWidth;
const desiredFirstSidebarWidth = Math.min(300, screenWidth * 0.15); // 20%, 최대 300px
const desiredSecondSidebarWidth = Math.min(600, screenWidth * 0.35); // 30%, 최대 600px

const MainPageLayout: React.FC = () => {
  const prevFirstSidebarWidth = useRef<number>(250);
  const prevSecondSidebarWidth = useRef<number>(desiredSecondSidebarWidth);
  const [firstSidebarWidth, setFirstSidebarWidth] = useState<number>(
    desiredFirstSidebarWidth
  );
  const [secondSidebarWidth, setSecondSidebarWidth] = useState<number>(
    desiredSecondSidebarWidth
  );
  const [title, setTitle] = useState<string>('');
  const isMSize = useMediaQuery('(max-width: 1024px)');
  const isSSize = useMediaQuery('(max-width: 768px)');

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

  useEffect(() => {
    if (isSSize) {
      setFirstSidebarWidth(0);
      setSecondSidebarWidth(0);
    } else if (isMSize) {
      setFirstSidebarWidth(0);
      setSecondSidebarWidth(prevSecondSidebarWidth.current);
    } else {
      setFirstSidebarWidth(prevFirstSidebarWidth.current);
      setSecondSidebarWidth(prevSecondSidebarWidth.current);
    }
  }, [isMSize, isSSize]);

  return (
    <Box sx={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      <TobBar
        toggleFirstSidebar={toggleFirstSidebar}
        toggleSecondSidebar={toggleSecondSidebar}
        title={title}
        setTitle={setTitle}
      />
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        {/* 첫 번째 사이드바 */}
        <ResizableBox
          width={firstSidebarWidth}
          height={Infinity}
          axis="x" //좌우 너비 조절
          resizeHandles={['e']} //핸들을 오른쪽에 위치(e: east)
          minConstraints={[200, Infinity]} //[너비,높이]
          maxConstraints={[400, Infinity]}
          handle={
            firstSidebarWidth === 0 ? <></> : <span className="custom-handle" />
          }
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
          minConstraints={[400, Infinity]}
          maxConstraints={[1000, Infinity]}
          handle={
            secondSidebarWidth === 0 ? (
              <></>
            ) : (
              <span className="custom-handle" />
            )
          }
          onResizeStop={(e: any, data: { size: { width: number } }) => {
            prevSecondSidebarWidth.current = data.size.width;
          }}
        >
          <Box
            sx={{
              display: secondSidebarWidth === 0 ? 'none' : 'block',
              height: '100%',
            }}
          >
            <SecondSidebar />
          </Box>
        </ResizableBox>

        {/* 메인 콘텐츠 */}
        <Box
          sx={{
            flex: 1, //flex-grow의 단축 형태로, 해당 요소가 남은 공간을 채우게 함.
            overflow: 'auto',
            minWidth: 200,
          }}
        >
          <MainContent title={title} setTitle={setTitle} />
        </Box>
      </Box>
    </Box>
  );
};

export default MainPageLayout;
