import { auth } from '../firebase';
import MainPageLayout from './MainPageLayout';
import { MainPageManager } from './MainPageManager';
import { LiveblocksProvider } from '@liveblocks/react/suspense';
import { useEffect, useState } from 'react';
const MainPage: React.FC = () => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const unregister = auth.onAuthStateChanged((user) => {
      if (user) {
        setReady(true); // auth.currentUser 보장되는 시점
      }
    });
    return () => unregister();
  }, []);
  if (!ready) return null; // 또는 로딩 UI
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
