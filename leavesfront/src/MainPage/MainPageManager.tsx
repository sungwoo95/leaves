import React, { createContext, useState, useContext, ReactNode } from "react";

type MainPageContextType = {
  treeId: string | undefined;
  setTreeId: React.Dispatch<React.SetStateAction<string | undefined>>;
  leafId: string | undefined;
  setLeafId: React.Dispatch<React.SetStateAction<string | undefined>>;
};

type MainPageProps = {
  children: ReactNode;
};
//Context 생성
const MainPageContext = createContext<MainPageContextType | undefined>(undefined);

export function MainPageManager({ children }: MainPageProps) {
  const [treeId, setTreeId] = useState<string | undefined>(undefined);
  const [leafId, setLeafId] = useState<string | undefined>(undefined);

  return (
    <MainPageContext.Provider
      value={{
        treeId,
        setTreeId,
        leafId,
        setLeafId,
      }}>
      {children}
    </MainPageContext.Provider>
  );
}

export const useMainPageContext = () => useContext(MainPageContext);
