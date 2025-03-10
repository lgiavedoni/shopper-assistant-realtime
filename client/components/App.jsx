import { useEffect, useRef, useState } from "react";
import logo from "/assets/openai-logomark.svg";
import EventLog from "./EventLog";
import SessionControls from "./SessionControls";
import ToolPanel from "./ToolPanel";
import ShowProductsPanel from "./ShowProductsPanel";
import CartPanel from "./CartPanel";
import HomePanel from './HomePanel';
import { SessionProvider } from '../context/SessionContext';
import catalogData from "../assets/catalog";
// import catalogData from "../assets/catalog_full";
import Hero from './Hero';
import FooterPanel from './FooterPanel';
import CompareProductsPanel from './CompareProductsPanel';
import CheckoutPanel from './CheckoutPanel';
import OrderConfirmationPanel from './OrderConfirmationPanel';

export default function App() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [events, setEvents] = useState([]);
  const [dataChannel, setDataChannel] = useState(null);
  const peerConnection = useRef(null);
  const audioElement = useRef(null);
  const [hasProductsToDisplay, setHasProductsToDisplay] = useState(false);
  const [hasComparison, setHasComparison] = useState(false);
  const [hasCheckout, setHasCheckout] = useState(false);
  const [hasOrderConfirmation, setHasOrderConfirmation] = useState(false);
  const [activePanel, setActivePanel] = useState('home'); // 'home', 'products', 'compare', 'checkout', 'confirmation'

  async function startSession() {
    // Get an ephemeral key from the Fastify server
    const tokenResponse = await fetch("/token");
    const data = await tokenResponse.json();
    const EPHEMERAL_KEY = data.value || data.client_secret?.value;

    if (!EPHEMERAL_KEY) {
      console.error('Failed to get valid token from server');
      return;
    }

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

    const DEFAULT_INSTRUCTIONS = `You are AI shopping assistant in the ecommerce website for the go-pro company,
    Your goal is to help the user find the best products for their needs and support them in their shopping experience.
    Don't give long answers, just the answer.  Keep your answers concise and to the point.
    Don't act too much like a salesman and Don't be over the limit nice.
    If you don't know the answer, just say you don't know.
    Do not refere me to the website, just answer the question or say you don't know.
    Do not use the name of the product once is clear that we are talking about it.

    Additiona context:
    - commercetools valencia office address: C. del Pintor Sorolla, 5, planta 6, Ciutat Vella, 46002 València, Valencia
    
    You will have tools, use them. Think of your main actions as PLP, PDF, Add to Cart, Checkout, etc.
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
    if (!dataChannel || dataChannel.readyState !== "open") {
      console.warn("Data channel not ready - message queued:", message);
      // Optionally queue the message for later or handle the error state
      return;
    }

    message.event_id = message.event_id || crypto.randomUUID();
    dataChannel.send(JSON.stringify(message));
    setEvents((prev) => [message, ...prev]);
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
      // Wait for data channel to be ready before sending initial messages
      dataChannel.addEventListener("open", () => {
        setIsSessionActive(true);
        setEvents([]);
        
        // Send catalog data
        sendClientEvent({
          type: "conversation.item.create",
          item: {
            type: "message",
            role: "system",
            content: [
              {
                type: "input_text",
                text: `here is additional information about your catalog: ${catalogData}`,
              },
            ],
          },
        });

        // Start conversation
        sendTextMessage("hi");
      });

      // Append new server events to the list
      dataChannel.addEventListener("message", (e) => {
        const newEvent = JSON.parse(e.data);
        // console.log("Received new event:", newEvent.type, newEvent.name, newEvent.function?.name, newEvent); // Debug log
        if(newEvent.response?.status === "failed") {
          console.log("Failed event:", newEvent);
        }
        
        // Check if the event contains product display function call
        if ((newEvent.type === "function_call" && 
            newEvent.function?.name === "display_products_search_results") ||
            (newEvent.type === "response.function_call_arguments.done" && 
              newEvent.name === "display_products_search_results")
          )
             {
          setHasProductsToDisplay(true);
        }

        // Add detection for comparison function
        if ((newEvent.type === "function_call" && 
            newEvent.function?.name === "display_product_comparison") ||
            (newEvent.type === "response.function_call_arguments.done" && 
              newEvent.name === "display_product_comparison")
          ) {
          setHasComparison(true);
        }
        
        if ((newEvent.type === "function_call" && 
            newEvent.function?.name === "display_checkout") ||
            (newEvent.type === "response.function_call_arguments.done" && 
              newEvent.name === "display_checkout")
          ) {
          setHasCheckout(true);
        }
        
        if ((newEvent.type === "function_call" && 
            newEvent.function?.name === "display_order_confirmation") ||
            (newEvent.type === "response.function_call_arguments.done" && 
              newEvent.name === "display_order_confirmation")
          ) {
          setHasOrderConfirmation(true);
        }
        
        setEvents((prev) => {
          const eventExists = prev.some(event => 
            event.event_id === newEvent.event_id
          );
          if (eventExists) return prev;
          return [newEvent, ...prev];
        });

        // Set active panel based on function calls
        if ((newEvent.type === "function_call" || 
            newEvent.type === "response.function_call_arguments.done")) {
          switch (newEvent.function?.name || newEvent.name) {
            case "display_products_search_results":
              setActivePanel('products');
              break;
            case "display_product_comparison":
              setActivePanel('compare');
              break;
            case "display_checkout":
              setActivePanel('checkout');
              break;
            case "display_order_confirmation":
              setActivePanel('confirmation');
              break;
          }
        }
      });
    }
  }, [dataChannel]);

  return (
    <main className="min-h-screen w-full overflow-y-auto">
      <Hero />
      <SessionProvider sendClientEvent={sendClientEvent}>
        <section className="p-2 sm:p-4">
          <div className="w-full max-w-7xl mx-auto">
            <SessionControls
              startSession={startSession}
              stopSession={stopSession}
              sendClientEvent={sendClientEvent}
              sendTextMessage={sendTextMessage}
              events={events}
              isSessionActive={isSessionActive}
            />
          </div>
        </section>
        
        <div className="p-2 sm:p-4 space-y-2 sm:space-y-4">
          <div className={`${activePanel !== 'confirmation' ? 'block' : 'hidden'}`}>
            <CartPanel
              sendClientEvent={sendClientEvent}
              sendTextMessage={sendTextMessage}
              events={events}
              isSessionActive={isSessionActive}
            />
            <br />
          </div>
          <section className="w-full max-w-7xl mx-auto space-y-2 sm:space-y-4">
            <div className={`${activePanel === 'home' ? 'block' : 'hidden'}`}>
              <HomePanel />
            </div>
            
            <div className={`${activePanel === 'checkout' && activePanel !== 'confirmation' ? 'block' : 'hidden'}`}>
              <CheckoutPanel
                sendClientEvent={sendClientEvent}
                sendTextMessage={sendTextMessage}
                events={events}
                isSessionActive={isSessionActive}
              />
            </div>
            
            <div className={`${activePanel === 'products' ? 'block' : 'hidden'}`}>
              <ShowProductsPanel
                sendClientEvent={sendClientEvent}
                sendTextMessage={sendTextMessage}
                events={events}
                isSessionActive={isSessionActive}
              />
            </div>

            <div className={`${activePanel === 'compare' ? 'block' : 'hidden'}`}>
              <CompareProductsPanel
                sendClientEvent={sendClientEvent}
                sendTextMessage={sendTextMessage}
                events={events}
                isSessionActive={isSessionActive}
              />
            </div>

            <div className={`${activePanel === 'confirmation' ? 'block' : 'hidden'}`}>
              <OrderConfirmationPanel
                sendClientEvent={sendClientEvent}
                sendTextMessage={sendTextMessage}
                events={events}
                isSessionActive={isSessionActive}
              />
            </div>
          </section>
        </div>

      </SessionProvider>
      <div className="h-16"></div>
      <FooterPanel />
    </main>
  );
}
