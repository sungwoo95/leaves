import React, { createContext, useState, useContext, ReactNode } from "react";

type SpaceContextType = {
  treeId: string | undefined;
  setTreeId: React.Dispatch<React.SetStateAction<string | undefined>>;
  leafId: string | undefined;
  setLeafId: React.Dispatch<React.SetStateAction<string | undefined>>;
};

type SpaceProps = {
  children: ReactNode;
};
//Context 생성
const SpaceContext = createContext<SpaceContextType | undefined>(undefined);

export function Space({ children }: SpaceProps) {
  const [treeId, setTreeId] = useState<string | undefined>(undefined);
  const [leafId, setLeafId] = useState<string | undefined>(undefined);

  return (
    <SpaceContext.Provider
      value={{
        treeId,
        setTreeId,
        leafId,
        setLeafId,
      }}>
      {children}
    </SpaceContext.Provider>
  );
}

export const useSpaceContext = () => useContext(SpaceContext);
