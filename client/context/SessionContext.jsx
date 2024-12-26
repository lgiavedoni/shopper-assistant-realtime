import { createContext, useContext, useState, useCallback } from 'react';

const SessionContext = createContext(null);

export function SessionProvider({ children, sendClientEvent }) {
  const [functionAdded, setFunctionAdded] = useState(false);
  const [tools, setTools] = useState({});
  
  const registerTool = useCallback((toolDefinition) => {
    console.log("registerTool", toolDefinition.name, toolDefinition);
    setTools(prev => ({
      ...prev,
      [toolDefinition.name]: toolDefinition
    }));
  }, []);

  const updateSession = useCallback(() => {
    if (!functionAdded && Object.keys(tools).length > 0) {
      console.log("updateSession", tools);
      sendClientEvent({
        type: "session.update",
        session: {
          tools: Object.values(tools),
          tool_choice: "auto",
        },
      });
      setFunctionAdded(true);
    }
  }, [functionAdded, tools, sendClientEvent]);

  const registerTools = useCallback((events) => {
    if (!events || events.length === 0) return;

    for (let i = events.length - 1; i >= 0; i--) {
      const event = events[i];
      if (!functionAdded && event.type === "session.created") {
        updateSession();
        break;
      }
    }
  }, [functionAdded, updateSession]);

  return (
    <SessionContext.Provider value={{ 
      registerTools, 
      registerTool, 
      functionAdded, 
      setFunctionAdded 
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
} 