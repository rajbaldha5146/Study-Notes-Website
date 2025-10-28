import { createContext, useContext, useState, useCallback, useMemo } from 'react';

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

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    refreshTrigger,
    refreshFolders
  }), [refreshTrigger, refreshFolders]);

  return (
    <FolderContext.Provider value={value}>
      {children}
    </FolderContext.Provider>
  );
};