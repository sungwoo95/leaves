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
    const webSocketInstance = new WebSocket(WS_PATH);
    setWs(webSocketInstance);
    return () => {
      webSocketInstance.close();
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
