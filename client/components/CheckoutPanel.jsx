import { useEffect, useMemo, useState, useRef } from 'react';
import { useFunctionCall } from '../hooks/useFunctionCall';
import { useSession } from '../context/SessionContext';
import { loader } from '../../src/util/googleMapsLoader';

const checkoutTool = {
  type: "function",
  name: "display_checkout",
  description: `Call this function to display the checkout panel with shipping and payment information.
                Use this when the user wants to proceed to checkout or complete their purchase.
                Allways ask for the address or you won't be able to complete the purchase.`,
  parameters: {
    type: "object",
    strict: true,
    properties: {
      total: {
        type: "string",
        description: "The total amount to be paid, including currency symbol"
      },
      address: {
        type: "object",
        description: "The address to be used for shipping",
        properties: {
          street: { type: "string" },
          city: { type: "string" },
          state: { type: "string" },
          zipCode: { type: "string" }
        }
      },
      paymentMethod: {
        type: "string",
        description: "The user has two payment methods stored, ask for confirmation if will be the visa or mastercard"
      }
    },
    required: ["total", "address", "paymentMethod"]
  }
};

function CheckoutForm({ functionCallOutput }) {
  const { total, address } = JSON.parse(functionCallOutput.arguments);
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  
  useEffect(() => {
    let mounted = true;
    const initMap = async () => {
      if (!mapRef.current) return;
      
      const addressString = `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
      
      try {
        const google = await loader.load();
        
        // Only create map if it doesn't exist yet
        if (!mapRef.current.firstChild) {
          const map = new google.maps.Map(mapRef.current, {
            zoom: 2,
            center: { lat: 20, lng: 0 },
            disableDefaultUI: true,
            zoomControl: true,
            scrollwheel: false,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
              }
            ]
          });
          
          mapRef.current.map = map;
        }

        const map = mapRef.current.map;
        
        // Update geocoding call
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: addressString }, (results, status) => {
          if (!mounted) return;
          
          if (status === 'OK' && results && results[0]) {
            const location = results[0].geometry.location;
            setMapCenter({ lat: location.lat(), lng: location.lng() });
            
            map.setCenter(location);
            
            if (markerRef.current) {
              markerRef.current.setMap(null);
            }
            markerRef.current = new google.maps.Marker({
              map,
              position: location,
            });
          }
        });
      } catch (error) {
        console.error('Map initialization failed:', error);
      }
    };

    initMap();
    
    return () => {
      mounted = false;
    };
  }, [address.street, address.city, address.state, address.zipCode]); // Only depend on address values

  // Mock user data - in a real app, this would come from your user context/state
  const userData = {
    name: "John Doe",
    email: "john.doe@example.com",
    address: address,
    savedCards: [
      { last4: "4242", brand: "Visa", expiry: "12/24" },
      { last4: "8888", brand: "Mastercard", expiry: "06/25" }
    ]
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Shipping Information */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
        <div className="space-y-4">
          <div className="flex flex-col">
            <label className="text-sm text-gray-600">Name</label>
            <input 
              type="text" 
              value={userData.name}
              className="border rounded-md p-2 bg-gray-50" 
              readOnly 
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-gray-600">Email</label>
            <input 
              type="email" 
              value={userData.email} 
              className="border rounded-md p-2 bg-gray-50" 
              readOnly 
            />
          </div>
          {/* Address fields - only show if address data exists */}
          {userData.address.street && (
            <>
              <div className="flex flex-col">
                <label className="text-sm text-gray-600">Address</label>
                <input 
                  type="text" 
                  value={userData.address.street} 
                  className="border rounded-md p-2 bg-gray-50" 
                  readOnly 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600">City</label>
                  <input 
                    type="text" 
                    value={userData.address.city} 
                    className="border rounded-md p-2 bg-gray-50" 
                    readOnly 
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600">State</label>
                  <input 
                    type="text" 
                    value={userData.address.state} 
                    className="border rounded-md p-2 bg-gray-50" 
                    readOnly 
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <label className="text-sm text-gray-600">ZIP Code</label>
                <input 
                  type="text" 
                  value={userData.address.zipCode} 
                  className="border rounded-md p-2 bg-gray-50" 
                  readOnly 
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Map Section - removed md:col-span-2 */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4">Delivery Location</h2>
        <div 
          ref={mapRef}
          className="w-full h-[300px] rounded-lg overflow-hidden"
        />
      </div>

      {/* Payment Information */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4">Payment Method</h2>
        <div className="space-y-4">
          {userData.savedCards.map((card, index) => (
            <label key={index} className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
              <input 
                type="radio" 
                name="payment" 
                defaultChecked={index === 0}
                className="mr-3" 
              />
              <div className="flex items-center gap-2">
                <span className="font-medium">{card.brand}</span>
                <span className="text-gray-600">•••• {card.last4}</span>
                <span className="text-gray-400 text-sm">Expires {card.expiry}</span>
              </div>
            </label>
          ))}
          
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium">Total:</span>
              <span className="text-xl font-bold text-green-600">{total}</span>
            </div>
            <button className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors">
              Complete Purchase
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPanel({ isSessionActive, sendClientEvent, events }) {
  const { registerTool } = useSession();
  
  useEffect(() => {
    registerTool(checkoutTool);
  }, []);

  const functionCallOutput = useFunctionCall({
    functionName: checkoutTool.name,
    isSessionActive,
    events,
    processedFlag: 'processedCheckout',
    afterFunctionCall: () => {
      sendClientEvent({
        type: "response.create",
        response: {
          instructions: "ask if they would like to proceed with the purchase",
        },
      });
    }
  });

  if (!functionCallOutput) return null;

  try {
    const parsed = JSON.parse(functionCallOutput.arguments);
    if (!parsed.total) return null;
  } catch (e) {
    console.error('Failed to parse checkout data:', e);
    return null;
  }

  return (
    <section className="w-full overflow-auto">
      <div className="bg-gray-50 rounded-md p-4">
        <CheckoutForm functionCallOutput={functionCallOutput} />
      </div>
    </section>
  );
} 