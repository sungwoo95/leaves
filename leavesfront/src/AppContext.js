import React, { createContext, useState, useContext } from "react";

// Context 생성
const AppContext = createContext();

export function AppProvider({ children }) {
  const [searchDirectory, setSearchDirectory] = useState(null); 
  const [searchTreeId, setSearchTreeId] = useState(null); 
  const [currentNodeDirectory, setCurrentNodeDirectory] = useState(null); 
  const [currentNodeTreeId, setCurrentNodeTreeId] = useState(null); 
  const [currentNodeId, setCurrentNodeId] = useState(null); 

  return (
    <AppContext.Provider
      value={{
        searchDirectory,
        setSearchDirectory,
        searchTreeId,
        setSearchTreeId,
        currentNodeDirectory,
        setCurrentNodeDirectory,
        currentNodeTreeId,
        setCurrentNodeTreeId,
        currentNodeId,
        setCurrentNodeId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);
