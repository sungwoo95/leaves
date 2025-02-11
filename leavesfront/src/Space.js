import React, { createContext, useState, useContext } from "react";

// Context 생성
const SpaceContext = createContext();

export function Space({ children }) {
  const [treeId, setTreeId] = useState(1);
  const [leafId, setLeafId] = useState(null); 

  return (
    <SpaceContext.Provider
      value={{
        treeId,
        setTreeId,
        leafId,
        setLeafId,
      }}
    >
      {children}
    </SpaceContext.Provider>
  );
}

export const useSpaceContext = () => useContext(SpaceContext);
