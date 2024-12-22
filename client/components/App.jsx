import { useEffect, useRef, useState } from "react";
import logo from "/assets/openai-logomark.svg";
import EventLog from "./EventLog";
import SessionControls from "./SessionControls";
import ToolPanel from "./ToolPanel";
import ShowProductsPanel from "./ShowProductsPanel";
import CartPanel from "./CartPanel";
import { SessionProvider } from '../context/SessionContext';

export default function App() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [events, setEvents] = useState([]);
  const [dataChannel, setDataChannel] = useState(null);
  const peerConnection = useRef(null);
  const audioElement = useRef(null);

  async function startSession() {
    // Get an ephemeral key from the Fastify server
    const tokenResponse = await fetch("/token");
    const data = await tokenResponse.json();
    const EPHEMERAL_KEY = data.client_secret.value;

    // Create a peer connection
    const pc = new RTCPeerConnection();

    // Set up to play remote audio from the model
    audioElement.current = document.createElement("audio");
    audioElement.current.autoplay = true;
    pc.ontrack = (e) => (audioElement.current.srcObject = e.streams[0]);

    // Add local audio track for microphone input in the browser
    const ms = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    pc.addTrack(ms.getTracks()[0]);

    // Set up data channel for sending and receiving events
    const dc = pc.createDataChannel("oai-events");
    setDataChannel(dc);

    // Start the session using the Session Description Protocol (SDP)
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const DEFAULT_INSTRUCTIONS = `You are AI shopping assistant that works for the go-pro company,
Your goal is to help the user find the best products for their needs and support them in their shopping experience.
Don't give long answers, just the answer.  Keep your answers concise and to the point.
Don't act too much like a salesman and Don't be over the limit nice.
If you don't know the answer, just say you don't know.
Do not refere me to the website, just answer the question or say you don't know.
Do not use the name of the product once is clear that we are talking about it.

Here is your list of products:
[
  {
    "name": "GoPro Hero 12",
    "description": "The GoPro Hero 12 is a powerful action camera that captures stunning 5.3K video and 20MP photos.",
    "price": "$399.99",
    "image": "https://gppro.in/wp-content/uploads/2023/09/HERO12-1.jpg"
  },
  {
    "name": "GoPro Hero 11",
    "description": "The GoPro Hero 11 is a powerful action camera that captures stunning 5.3K video and 20MP photos.",
    "price": "$100.99",
    "image": "https://photolaplante.com/cdn/shop/files/Hero12004_800x.jpg?v=1694015338"
  }
]
`;

    const url = new URL('https://api.openai.com/v1/realtime');
    url.searchParams.set('model', 'gpt-4o-realtime-preview-2024-12-17');
    url.searchParams.set('instructions', DEFAULT_INSTRUCTIONS);
    // url.searchParams.set('voice', 'verse');

    const sdpResponse = await fetch(url, {
      method: "POST",
      body: offer.sdp,
      headers: {
        Authorization: `Bearer ${EPHEMERAL_KEY}`,
        "Content-Type": "application/sdp",
      },
    });

    const answer = {
      type: "answer",
      sdp: await sdpResponse.text(),
    };
    await pc.setRemoteDescription(answer);

    peerConnection.current = pc;
  }

  // Stop current session, clean up peer connection and data channel
  function stopSession() {
    if (dataChannel) {
      dataChannel.close();
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }

    setIsSessionActive(false);
    setDataChannel(null);
    peerConnection.current = null;
  }

  // Send a message to the model
  function sendClientEvent(message) {
    console.log("sendClientEvent", message);
    if (dataChannel) {
      message.event_id = message.event_id || crypto.randomUUID();
      dataChannel.send(JSON.stringify(message));
      setEvents((prev) => [message, ...prev]);
    } else {
      console.error(
        "Failed to send message - no data channel available",
        message,
      );
    }
  }

  // Send a text message to the model
  function sendTextMessage(message) {
    const event = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text: message,
          },
        ],
      },
    };

    sendClientEvent(event);
    sendClientEvent({ type: "response.create" });
  }

  // Attach event listeners to the data channel when a new one is created
  useEffect(() => {
    if (dataChannel) {
      // Append new server events to the list
      dataChannel.addEventListener("message", (e) => {
        const newEvent = JSON.parse(e.data);
        // console.log("Received event:", newEvent);  // Debug log
        
        setEvents((prev) => {
          // Ensure we're not duplicating events
          const eventExists = prev.some(event => 
            event.event_id === newEvent.event_id
          );
          if (eventExists) return prev;
          return [newEvent, ...prev];
        });
      });

      // Set session active when the data channel is opened
      dataChannel.addEventListener("open", () => {
        setIsSessionActive(true);
        setEvents([]);
      });
    }
  }, [dataChannel]);

  return (
    <>
      <nav className="absolute top-0 left-0 right-0 h-16 flex items-center">
        <div className="flex items-center gap-4 w-full m-4 pb-2 border-0 border-b border-solid border-gray-200">
          <img style={{ width: "24px" }} src={logo} />
          <h1>realtime console</h1>
        </div>
      </nav>
      <main className="absolute top-16 left-0 right-0 bottom-0">
        <SessionProvider sendClientEvent={sendClientEvent}>
          <section className="absolute top-0 left-0 right-[760px] bottom-0 flex">
            <section className="absolute top-0 left-0 right-0 bottom-32 px-4 overflow-y-auto">
              <EventLog events={events} />
            </section>
            <section className="absolute h-32 left-0 right-0 bottom-0 p-4">
              <SessionControls
                startSession={startSession}
                stopSession={stopSession}
                sendClientEvent={sendClientEvent}
                sendTextMessage={sendTextMessage}
                events={events}
                isSessionActive={isSessionActive}
              />
            </section>
          </section>
          <section className="absolute top-0 w-[380px] right-[380px] bottom-0 p-4 pt-0 overflow-y-auto">
            <ShowProductsPanel
              sendClientEvent={sendClientEvent}
              sendTextMessage={sendTextMessage}
              events={events}
              isSessionActive={isSessionActive}
            />
          </section>
          <section className="absolute top-0 w-[380px] right-0 bottom-0 p-4 pt-0 overflow-y-auto">
            <CartPanel
              sendClientEvent={sendClientEvent}
              sendTextMessage={sendTextMessage}
              events={events}
              isSessionActive={isSessionActive}
            />
          </section>
        </SessionProvider>
      </main>
    </>
  );
}
