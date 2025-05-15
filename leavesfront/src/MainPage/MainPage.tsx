import MainPageLayout from './MainPageLayout';
import { MainPageManager } from './MainPageManager';
import { LiveblocksProvider } from '@liveblocks/react/suspense';
const MainPage: React.FC = () => {
  return (
    <LiveblocksProvider
      publicApiKey={
        'pk_dev_ulmgQtI2bal6N7t2M_muXvzWbqTWTGPBdzQo6Pn3MhJkzV0iZXUQfKk1r47agtFM'
      }
    >
      <MainPageManager>
        <MainPageLayout />
      </MainPageManager>
    </LiveblocksProvider>
  );
};

export default MainPage;
