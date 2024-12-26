import { useEffect } from 'react';
import { useFunctionCall } from '../hooks/useFunctionCall';
import { useSession } from '../context/SessionContext';

const cartTool = {
  type: "function",
  name: "display_cart",
  description: 'Call this function every time that there is a change in the cart.',
  parameters: {
    type: "object",
    strict: true,
    properties: {
      products: {
        type: "array",
        description: "Array of all the products that are in the user's cart.",
        items: {
          type: "object",
          properties: {
            "name": { "type": "string" },
            "description": { "type": "string" },
            "price": { "type": "string" },
            "image": { "type": "string" },
          },
        },
      },
    },
    required: ["products","image","price"],
  },
};

function CartDisplay({ functionCallOutput }) {
  let products = [];
  
  try {
    const parsedData = JSON.parse(functionCallOutput.arguments);
    products = parsedData.products;
  } catch (error) {
    console.error('Error parsing cart data:', error);
    console.log('Failed to parse:', functionCallOutput.arguments);
    return <p>Error loading cart data</p>;
  }
  
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="shrink-0 w-full sm:w-auto mb-2 sm:mb-0">
        <p className="font-bold">Your Cart</p>
      </div>
      <div className="flex-1 w-full overflow-x-auto">
        <div className="flex flex-col sm:flex-row gap-4">
          {products.map((product) => (
            <div
              key={product.name}
              className="w-full sm:w-[250px] sm:shrink-0 p-3 rounded-md flex items-center justify-between border border-gray-200 bg-white"
            >
              <img 
                src={product.image || '/assets/not_found_icon.jpg'} 
                alt={product.name} 
                className="w-12 h-12 object-cover rounded"
                onError={(e) => {
                  e.target.src = '/assets/not_found_icon.jpg';
                  e.target.onerror = null;
                }}
              />
              <p className="font-bold flex-1 mx-3 truncate">{product.name}</p>
              <p className="font-bold text-green-600 shrink-0">{product.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CartPanel({ isSessionActive, events }) {
  const { registerTool } = useSession();
  
  useEffect(() => {
    registerTool(cartTool);
  }, []);

  const cartProducts = useFunctionCall({
    functionName: cartTool.name,
    isSessionActive,
    events,
    processedFlag: 'processedCart'
  });

  return (
    <section className="w-full max-w-7xl mx-auto">
      <div className="bg-gray-50 rounded-md p-4 h-full flex flex-col">
        {isSessionActive ? (
          cartProducts ? (
            <CartDisplay functionCallOutput={cartProducts} />
          ) : (
            <p>Your Cart is empty...</p>
          )
        ) : (
          <p>Start the session to use this tool...</p>
        )}
      </div>
    </section>
  );
}
