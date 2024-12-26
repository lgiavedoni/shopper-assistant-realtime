import { useEffect } from 'react';
import { useFunctionCall } from '../hooks/useFunctionCall';
import { useSession } from '../context/SessionContext';

const checkoutTool = {
  type: "function",
  name: "display_checkout",
  description: `Call this function to display the checkout panel with shipping and payment information.
                Use this when the user wants to proceed to checkout or complete their purchase.`,
  parameters: {
    type: "object",
    strict: true,
    properties: {
      total: {
        type: "string",
        description: "The total amount to be paid, including currency symbol"
      }
    },
    required: ["total"]
  }
};

function CheckoutForm({ functionCallOutput }) {
  const { total } = JSON.parse(functionCallOutput.arguments);
  
  // Mock user data - in a real app, this would come from your user context/state
  const userData = {
    name: "John Doe",
    email: "john.doe@example.com",
    address: "123 Main Street",
    city: "San Francisco",
    state: "CA",
    zipCode: "94105",
    savedCards: [
      { last4: "4242", brand: "Visa", expiry: "12/24" },
      { last4: "8888", brand: "Mastercard", expiry: "06/25" }
    ]
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <div className="flex flex-col">
            <label className="text-sm text-gray-600">Address</label>
            <input 
              type="text" 
              value={userData.address} 
              className="border rounded-md p-2 bg-gray-50" 
              readOnly 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-sm text-gray-600">City</label>
              <input 
                type="text" 
                value={userData.city} 
                className="border rounded-md p-2 bg-gray-50" 
                readOnly 
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-gray-600">State</label>
              <input 
                type="text" 
                value={userData.state} 
                className="border rounded-md p-2 bg-gray-50" 
                readOnly 
              />
            </div>
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-gray-600">ZIP Code</label>
            <input 
              type="text" 
              value={userData.zipCode} 
              className="border rounded-md p-2 bg-gray-50" 
              readOnly 
            />
          </div>
        </div>
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