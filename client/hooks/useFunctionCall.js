import { useEffect, useState } from "react";
import { useSession } from '../context/SessionContext';

export function useFunctionCall({
  functionName,
  isSessionActive,
  events,
  onFunctionCall,
  processedFlag = 'processed',
  afterFunctionCall
}) {
  const { registerTools, functionAdded, setFunctionAdded } = useSession();
  const [functionCallOutput, setFunctionCallOutput] = useState(null);

  // Register tools when events change
  useEffect(() => {
    registerTools(events);
  }, [events, registerTools]);

  // Process events for function calls
  useEffect(() => {
    if (!events || events.length === 0) return;

    for (let i = events.length - 1; i >= 0; i--) {
      const event = events[i];
      
      if (
        event.type === "response.done" && 
        event.response?.output &&
        !event[processedFlag]
      ) {
        event[processedFlag] = true;
        
        event.response.output.forEach((output) => {
          if (output.type === "function_call" && output.name === functionName) {
            setFunctionCallOutput(output);
            onFunctionCall?.(output);
            
            if (afterFunctionCall) {
              setTimeout(() => afterFunctionCall(output), 500);
            }
          }
        });
      }
    }
  }, [events, functionName, processedFlag, onFunctionCall, afterFunctionCall]);

  // Reset state when session ends
  useEffect(() => {
    if (!isSessionActive) {
      setFunctionAdded(false);
      setFunctionCallOutput(null);
    }
  }, [isSessionActive, setFunctionAdded]);

  return functionCallOutput;
} 