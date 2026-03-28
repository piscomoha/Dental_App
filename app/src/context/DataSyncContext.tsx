import { createContext, useContext, useCallback, useRef } from 'react';

type DataChangeType = 'patient' | 'treatment' | 'appointment' | 'all';

interface DataSyncContextType {
  notifyDataChange: (type: DataChangeType) => void;
  subscribeToChanges: (callback: (type: DataChangeType) => void) => () => void;
}

const DataSyncContext = createContext<DataSyncContextType | undefined>(undefined);

export function DataSyncProvider({ children }: { children: React.ReactNode }) {
  const subscribersRef = useRef<Set<(type: DataChangeType) => void>>(new Set());

  const notifyDataChange = useCallback((type: DataChangeType) => {
    subscribersRef.current.forEach(callback => {
      try {
        callback(type);
      } catch (error) {
        console.error('Error in data change callback:', error);
      }
    });
  }, []);

  const subscribeToChanges = useCallback((callback: (type: DataChangeType) => void) => {
    subscribersRef.current.add(callback);
    return () => {
      subscribersRef.current.delete(callback);
    };
  }, []);

  return (
    <DataSyncContext.Provider value={{ notifyDataChange, subscribeToChanges }}>
      {children}
    </DataSyncContext.Provider>
  );
}

export function useDataSync() {
  const context = useContext(DataSyncContext);
  if (!context) {
    throw new Error('useDataSync must be used within DataSyncProvider');
  }
  return context;
}
