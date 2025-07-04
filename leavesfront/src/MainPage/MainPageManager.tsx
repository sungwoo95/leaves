import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useRef,
} from 'react';
import { WS_PATH } from '../../config/config';
import axiosInstance from '../axiosInstance';
import { MyForestInfo } from '../types';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import type { User } from 'firebase/auth';

type MainPageContextType = {
  myForests: MyForestInfo[];
  setMyForests: React.Dispatch<React.SetStateAction<MyForestInfo[]>>;
  treeId: string | null;
  setTreeId: React.Dispatch<React.SetStateAction<string | null>>;
  leafId: string | null;
  owningTreeId: string | undefined;
  setOwningTreeId: React.Dispatch<React.SetStateAction<string | undefined>>;
  setLeafId: React.Dispatch<React.SetStateAction<string | null>>;
  ws: WebSocket | undefined;
  isPublicTree: boolean | undefined;
  setIsPublicTree: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  isPublicLeaf: boolean | undefined;
  setIsPublicLeaf: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  isReady: boolean;
  user: User | undefined;
  setTreeForestId: React.Dispatch<React.SetStateAction<string | null>>;
  leafForestId: string | null;
  setLeafForestId: React.Dispatch<React.SetStateAction<string | null>>;
};

type MainPageProps = {
  children: ReactNode;
};
//Context 생성
const MainPageContext = createContext<MainPageContextType | undefined>(
  undefined
);

export function MainPageManager({ children }: MainPageProps) {
  const [myForests, setMyForests] = useState<MyForestInfo[]>([]);
  const [treeId, setTreeId] = useState<string | null>(null);
  const [leafId, setLeafId] = useState<string | null>(null);
  const [owningTreeId, setOwningTreeId] = useState<string | undefined>(
    undefined
  );
  const [isPublicTree, setIsPublicTree] = useState<boolean | undefined>(
    undefined
  );
  const [isPublicLeaf, setIsPublicLeaf] = useState<boolean | undefined>(
    undefined
  );
  const [ws, setWs] = useState<WebSocket | undefined>(undefined);
  const isMount = useRef<boolean>(true);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [user, setUser] = useState<User | undefined>(undefined);
  const [treeForestId, setTreeForestId] = useState<string | null>(null);
  const [leafForestId, setLeafForestId] = useState<string | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout;
    let webSocketInstance: WebSocket | undefined = undefined;
    const connectWebSocket = () => {
      if (webSocketInstance) {
        webSocketInstance.close();
      }
      webSocketInstance = new WebSocket(WS_PATH);
      webSocketInstance.onerror = (error) => {
        console.error('WebSocket 오류 발생:', error);
      };
      webSocketInstance.onclose = (event) => {
        if (!navigator.onLine) {
          //확인 필요.(wifi종료해도 수행x)
          console.warn('오프라인 상태 감지됨. 네트워크 복구 시 재연결 예정.');
          window.addEventListener(
            'online',
            () => {
              console.log('네트워크 복구됨! WebSocket 재연결 시도.');
              connectWebSocket();
            },
            { once: true }
          ); // 네트워크 복구 시 한 번만 실행됨
          return;
        }
        console.warn(
          'WebSocket 연결 종료, 3초 후 재연결 (code:',
          event.code,
          ')'
        );
        reconnectTimeout = setTimeout(() => {
          connectWebSocket();
        }, 3000);
      };
      setWs(webSocketInstance);
    };
    connectWebSocket();
    return () => {
      if (webSocketInstance) {
        webSocketInstance.close();
      }
      clearTimeout(reconnectTimeout);
    };
  }, []);
  //auth초기화 완료 시, mainPageData불러오기, isReady 설정.
  useEffect(() => {
    const getMainPageData = async () => {
      try {
        const response = await axiosInstance.get(`/user/mainPage`);
        const mainPageData = response.data;
        if (mainPageData.treeId) {
          setTreeId(mainPageData.treeId);
        }
        if (mainPageData.leafId) {
          setLeafId(mainPageData.leafId);
        }
        if (mainPageData.myForests) {
          setMyForests(mainPageData.myForests);
        }
        if (mainPageData.owningTreeId) {
          setOwningTreeId(mainPageData.owningTreeId);
        }
        setIsReady(true);
      } catch (error) {
        console.log(
          '[MainPageManager][getMainPageData]get /user/mainPage error'
        );
      }
    };
    const unregister = auth.onAuthStateChanged((user) => {
      if (user) {
        getMainPageData();
        setUser(user);
        console.log('user:', user);
      } else {
        setIsReady(false);
        navigate('/');
      }
    });
    return () => unregister();
  }, []);
  useEffect(() => {
    if (isMount.current) {
      isMount.current = false;
      return;
    }
    const postMainPageData = async () => {
      const postData = { treeId, leafId, owningTreeId };
      try {
        await axiosInstance.post(`/user/mainPage`, postData);
      } catch (error) {
        console.log(
          '[MainPageManager][postMainPageData]post /user/mainPage error:',
          error
        );
      }
    };
    postMainPageData();
  }, [treeId, leafId, owningTreeId]);
  return (
    <MainPageContext.Provider
      value={{
        myForests,
        setMyForests,
        treeId,
        setTreeId,
        leafId,
        setLeafId,
        owningTreeId,
        setOwningTreeId,
        ws,
        isPublicTree,
        setIsPublicTree,
        isPublicLeaf,
        setIsPublicLeaf,
        isReady,
        user,
        setTreeForestId,
        leafForestId,
        setLeafForestId,
      }}
    >
      {children}
    </MainPageContext.Provider>
  );
}

export const useMainPageContext = () => useContext(MainPageContext);
