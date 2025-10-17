import { createContext, useContext, useState, useCallback } from 'react';

const FolderContext = createContext();

export const useFolders = () => {
  const context = useContext(FolderContext);
  if (!context) {
    throw new Error('useFolders must be used within a FolderProvider');
  }
  return context;
};

export const FolderProvider = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshFolders = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const value = {
    refreshTrigger,
    refreshFolders
  };

  return (
    <FolderContext.Provider value={value}>
      {children}
    </FolderContext.Provider>
  );
};