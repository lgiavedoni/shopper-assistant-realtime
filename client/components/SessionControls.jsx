import { useState, useEffect, useRef } from "react";
import { CloudLightning, CloudOff, MessageSquare } from "react-feather";
import Button from "./Button";

function VoiceVisualizer({ isListening }) {
  const bubbles = Array(4).fill(null);
  
  return (
    <div className="flex items-center justify-center gap-2">
      {bubbles.map((_, i) => (
        <div
          key={i}
          className={`w-6 h-6 bg-[#36bdf4] rounded-full transition-all duration-200 ${
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
        className="!bg-[#36bdf4] hover:!bg-[#36bdf4] !text-black px-6 py-4 rounded-full font-sans font-medium"
        icon={<img src="/assets/ct_favicon.png" alt="CT Logo" className="w-4 h-4" />}
      >
        <span>
          {isActivating ? "Starting session..." : "Start voice session"}
        </span>
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
    <div className="flex flex-col items-center justify-end w-full h-full relative pb-4">
      <VoiceVisualizer isListening={isListening} />
      <Button 
        onClick={stopSession} 
        icon={<CloudOff height={16} />}
        className="rounded-full w-12 h-12 flex items-center justify-center !bg-[#36bdf4] hover:!bg-[#36bdf4] !text-black absolute bottom-4 right-4"
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
    <div className="flex flex-col items-center justify-end h-16">
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
