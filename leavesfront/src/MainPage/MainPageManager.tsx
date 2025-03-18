import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { WS_PATH } from "../../config/env";

type MainPageContextType = {
  treeId: string | undefined;
  setTreeId: React.Dispatch<React.SetStateAction<string | undefined>>;
  leafId: string | undefined;
  setLeafId: React.Dispatch<React.SetStateAction<string | undefined>>;
  ws: WebSocket | undefined;
};

type MainPageProps = {
  children: ReactNode;
};
//Context 생성
const MainPageContext = createContext<MainPageContextType | undefined>(undefined);

export function MainPageManager({ children }: MainPageProps) {
  const [treeId, setTreeId] = useState<string | undefined>(undefined);
  const [leafId, setLeafId] = useState<string | undefined>(undefined);
  const [ws, setWs] = useState<WebSocket | undefined>(undefined);
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
        if (!navigator.onLine) { //확인 필요.(wifi종료해도 수행x)
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
  return (
    <MainPageContext.Provider
      value={{
        treeId,
        setTreeId,
        leafId,
        setLeafId,
        ws,
      }}>
      {children}
    </MainPageContext.Provider>
  );
}

export const useMainPageContext = () => useContext(MainPageContext);
