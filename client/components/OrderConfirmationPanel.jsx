import { useEffect } from 'react';
import { useFunctionCall } from '../hooks/useFunctionCall';
import { useSession } from '../context/SessionContext';

const orderConfirmationTool = {
  type: "function",
  name: "display_order_confirmation",
  description: `Display the order confirmation panel after a successful purchase. 
                The order confirmation panel should be displayed after the user has 
                confirmed the purchase.
                `,
  parameters: {
    type: "object",
    strict: true,
    properties: {
      orderNumber: {
        type: "string",
        description: "The order confirmation number"
      },
      items: {
        type: "array",
        description: "List of purchased products",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            quantity: { type: "number" },
            price: { type: "string" }
          }
        }
      },
      total: {
        type: "string",
        description: "The total amount paid"
      }
    },
    required: ["orderNumber", "items", "total"]
  }
};

function OrderConfirmationDetails({ functionCallOutput }) {
  const { orderNumber, items, total } = JSON.parse(functionCallOutput.arguments);

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg p-6 shadow-sm">
      <div className="text-center mb-6">
        <div className="text-green-600 text-5xl mb-4">✓</div>
        <h1 className="text-2xl font-bold text-gray-800">Order Confirmed!</h1>
        <p className="text-gray-600 mt-2">Thank you for your purchase</p>
      </div>

      <div className="border-t border-b py-4 my-6">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Order Number:</span>
          <span className="font-mono font-medium">{orderNumber}</span>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold text-lg">Order Summary</h2>
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
            </div>
            <span>{item.price}</span>
          </div>
        ))}
        
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center font-bold">
            <span>Total Paid</span>
            <span className="text-green-600">{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPanel({ isSessionActive, sendClientEvent, events }) {
  const { registerTool } = useSession();
  
  useEffect(() => {
    registerTool(orderConfirmationTool);
  }, []);

  const functionCallOutput = useFunctionCall({
    functionName: orderConfirmationTool.name,
    isSessionActive,
    events,
    processedFlag: 'processedOrderConfirmation',
    afterFunctionCall: () => {
      sendClientEvent({
        type: "response.create",
        response: {
          instructions: "clear the cart and call any other tools that are needed",
        },
      });
    }
  });

  if (!functionCallOutput) return null;

  return (
    <section className="w-full overflow-auto">
      <div className="bg-gray-50 rounded-md p-4">
        <OrderConfirmationDetails functionCallOutput={functionCallOutput} />
      </div>
    </section>
  );
} 