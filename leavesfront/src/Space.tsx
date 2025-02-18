import React, { createContext, useState, useContext, ReactNode } from "react";

type SpaceContextType = {
  treeId: number;
  setTreeId: React.Dispatch<React.SetStateAction<number>>;
  leafId: string | null;
  setLeafId: React.Dispatch<React.SetStateAction<string | null>>;
};

type SpaceProps = {
  children: ReactNode;
};
// Context 생성
const SpaceContext = createContext<SpaceContextType | null>(null);

export function Space({ children }: SpaceProps) {
  const [treeId, setTreeId] = useState<number>(1);
  const [leafId, setLeafId] = useState<string | null>(null);

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
