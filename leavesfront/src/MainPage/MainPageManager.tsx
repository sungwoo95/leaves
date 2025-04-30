import React, { createContext, useState, useContext, ReactNode, useEffect, useRef } from "react";
import { path, WS_PATH } from "../../config/config";
import axios from "axios";

type MainPageContextType = {
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
};

type MainPageProps = {
  children: ReactNode;
};
//Context 생성
const MainPageContext = createContext<MainPageContextType | undefined>(undefined);

export function MainPageManager({ children }: MainPageProps) {
  const [treeId, setTreeId] = useState<string | null>(null);
  const [leafId, setLeafId] = useState<string | null>(null);
  const [owningTreeId, setOwningTreeId] = useState<string | undefined>(undefined);
  const [isPublicTree, setIsPublicTree] = useState<boolean | undefined>(undefined);
  const [isPublicLeaf, setIsPublicLeaf] = useState<boolean | undefined>(undefined);
  const [ws, setWs] = useState<WebSocket | undefined>(undefined);
  const isMount = useRef<boolean>(true);
  useEffect(() => {
    console.log("[MainPageManager] useEffect called");
    let reconnectTimeout: NodeJS.Timeout;
    let webSocketInstance: WebSocket | undefined = undefined;
    const connectWebSocket = () => {
      if (webSocketInstance) {
        webSocketInstance.close();
      }
      webSocketInstance = new WebSocket(WS_PATH);
      webSocketInstance.onopen = () => {
        console.log("WebSocket 연결 성공");
      };
      webSocketInstance.onerror = (error) => {
        console.error("WebSocket 오류 발생:", error);
      };
      webSocketInstance.onclose = (event) => {
        if (!navigator.onLine) {
          //확인 필요.(wifi종료해도 수행x)
          console.warn("오프라인 상태 감지됨. 네트워크 복구 시 재연결 예정.");
          window.addEventListener(
            "online",
            () => {
              console.log("네트워크 복구됨! WebSocket 재연결 시도.");
              connectWebSocket();
            },
            { once: true }
          ); // 네트워크 복구 시 한 번만 실행됨
          return;
        }
        console.warn("WebSocket 연결 종료, 3초 후 재연결 (code:", event.code, ")");
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
  useEffect(() => {
    const getMainPageData = async () => {
      try {
        const response = await axios.get(`${path}/user/mainPage`);
        const mainPageData = response.data;
        if (mainPageData.treeId) {
          setTreeId(mainPageData.treeId);
        }
        if (mainPageData.leafId) {
          setLeafId(mainPageData.leafId);
        }
      } catch (error) {
        console.log("[MainPageManager][getMainPageData]get /user/mainPage error");
      }
    };
    getMainPageData();
  }, []);
  useEffect(() => {
    if (isMount.current) {
      isMount.current = false;
      return;
    }
    const postMainPageData = async () => {
      const postData = { treeId, leafId };
      try {
        const response = await axios.post(`${path}/user/mainPage`, postData);
        console.log("[MainPageManager][postMainPageData]response:", response.data.message);
      } catch (error) {
        console.log("[MainPageManager][postMainPageData]post /user/mainPage error:", error);
      }
    };
    postMainPageData();
  }, [treeId, leafId]);
  return (
    <MainPageContext.Provider
      value={{
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
      }}>
      {children}
    </MainPageContext.Provider>
  );
}

export const useMainPageContext = () => useContext(MainPageContext);
