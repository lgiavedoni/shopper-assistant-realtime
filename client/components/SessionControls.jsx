import { useState, useEffect, useRef } from "react";
import { CloudLightning, CloudOff, MessageSquare } from "react-feather";
import Button from "./Button";

function VoiceVisualizer({ isListening }) {
  const bubbles = Array(4).fill(null);
  
  return (
    <div className="flex items-center justify-center gap-4 mb-4">
      {bubbles.map((_, i) => (
        <div
          key={i}
          className={`w-8 h-8 bg-white rounded-full transition-all duration-200 ${
            isListening ? 'animate-bounce' : ''
          }`}
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: "0.8s"
          }}
        />
      ))}
    </div>
  );
}

function SessionStopped({ startSession }) {
  const [isActivating, setIsActivating] = useState(false);

  function handleStartSession() {
    if (isActivating) return;
    setIsActivating(true);
    startSession();
  }

  return (
    <div className="flex items-center justify-center w-full h-full">
      <Button
        onClick={handleStartSession}
        className={isActivating ? "bg-gray-600" : "bg-red-600"}
        icon={<CloudLightning height={16} />}
      >
        {isActivating ? "starting session..." : "start session"}
      </Button>
    </div>
  );
}

function SessionActive({ stopSession, events }) {
  const [isListening, setIsListening] = useState(false);

  // Monitor events and stop animation when response is done
  useEffect(() => {
    if (events && events.length > 0) {
      const latestEvent = events[0];
      
      if (latestEvent.type === 'response.done') {
        setIsListening(false);
      } else {
        setIsListening(true);
        const timeout = setTimeout(() => setIsListening(false), 2000);
        return () => clearTimeout(timeout);
      }
    }
  }, [events]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full relative">
      <VoiceVisualizer isListening={isListening} />
      <Button 
        onClick={stopSession} 
        icon={<CloudOff height={16} />}
        className="rounded-full w-12 h-12 flex items-center justify-center bg-red-500 hover:bg-red-600 absolute bottom-4 right-4"
      />
    </div>
  );
}

export default function SessionControls({
  startSession,
  stopSession,
  isSessionActive,
  events,
}) {
  return (
    <div className="flex flex-col items-center justify-center border-t-2 border-gray-200 h-full rounded-md bg-gray-900 text-white">
      {isSessionActive ? (
        <SessionActive
          stopSession={stopSession}
          events={events}
        />
      ) : (
        <SessionStopped startSession={startSession} />
      )}
    </div>
  );
}
