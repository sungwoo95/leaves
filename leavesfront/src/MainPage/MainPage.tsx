import MainPageLayout from './MainPageLayout';
import { MainPageManager } from './MainPageManager';
const MainPage: React.FC = () => {
  return (
    <MainPageManager>
      <MainPageLayout />
    </MainPageManager>
  );
};

export default MainPage;
