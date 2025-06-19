import { Box, useMediaQuery } from '@mui/material';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import MainContent from './MainContent/MainContent';
import FirstSidebar from './firstSidebar/FirstSidebar';
import SecondSidebar from './SecondSidebar/SecondSidebar';
import '../../src/styles.css';
import { useEffect, useRef, useState } from 'react';
import TobBar from './MainContent/TopBar';

const desiredFirstSidebarWidth = 250;
const desiredSecondSidebarWidth = 450;

const MainPageLayout: React.FC = () => {
  const prevFirstSidebarWidth = useRef<number>(desiredFirstSidebarWidth);
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

  useEffect(() => {
    if (isSSize) {
      // 작은 화면: 둘 다 닫힌 상태로 시작
      setFirstSidebarWidth(0);
      setSecondSidebarWidth(0);
    } else if (isMSize) {
      // 중간 화면: 첫 번째 사이드바만 닫힘
      setFirstSidebarWidth(0);
      setSecondSidebarWidth(prevSecondSidebarWidth.current);
    } else {
      // 큰 화면: 둘 다 열림
      setFirstSidebarWidth(prevFirstSidebarWidth.current);
      setSecondSidebarWidth(prevSecondSidebarWidth.current);
    }
  }, [isMSize, isSSize]);

  const toggleFirstSidebar = () => {
    const newWidth = firstSidebarWidth === 0 ? prevFirstSidebarWidth.current : 0;
    setFirstSidebarWidth(newWidth);
    // 작은 화면에서 첫 번째 사이드바를 열면, 두 번째는 닫음
    if (isSSize && newWidth > 0) {
      setSecondSidebarWidth(0);
    }
  };

  const toggleSecondSidebar = () => {
    const newWidth = secondSidebarWidth === 0 ? prevSecondSidebarWidth.current : 0;
    setSecondSidebarWidth(newWidth);
    // 작은 화면에서 두 번째 사이드바를 열면, 첫 번째는 닫음
    if (isSSize && newWidth > 0) {
      setFirstSidebarWidth(0);
    }
  };

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
