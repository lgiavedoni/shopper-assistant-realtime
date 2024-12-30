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

  // Calculate cart total
  const cartTotal = products.reduce((total, product) => {
    // Skip products with invalid/missing prices
    if (!product?.price) return total;
    
    // Remove currency symbol and convert to number
    const price = parseFloat(product.price.replace(/[^0-9.-]+/g, ''));
    return isNaN(price) ? total : total + price;
  }, 0);
  
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="shrink-0 w-full sm:w-auto mb-2 sm:mb-0">
          <p className="font-bold">Your Cart</p>
        </div>
        <div className="flex-1 w-full overflow-x-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <div
                key={product.name}
                className="w-full p-3 rounded-md flex items-center justify-between border border-gray-200 bg-white"
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
      
      {/* Add cart total */}
      <div className="flex justify-end border-t pt-4">
        <p className="text-lg font-bold">
          Total: ${cartTotal.toFixed(2)}
        </p>
      </div>
    </div>
  );
}

export default function CartPanel({ isSessionActive, sendClientEvent, events }) {
  const { registerTool } = useSession();
  
  useEffect(() => {
    registerTool(cartTool);
  }, []);

  const cartProducts = useFunctionCall({
    functionName: cartTool.name,
    isSessionActive,
    events,
    processedFlag: 'processedCart',
    afterFunctionCall: () => {
      sendClientEvent({
        type: "response.create",
        response: {
          instructions: `
          Let the customer know that you added the products to the cart (important: dont mention the products names).
          Ask how else we can assist them.
          `,
        },
      });
    }
  });

  // Add error handling for JSON parsing
  let hasProducts = false;
  try {
    hasProducts = cartProducts && JSON.parse(cartProducts.arguments).products.length > 0;
  } catch (error) {
    console.error('Error parsing cart products:', error,'JSON: ', cartProducts.arguments);
    return null;
  }

  // Don't render anything if there are no products or session isn't active
  if (!isSessionActive || !hasProducts) {
    return null;
  }

  return (
    <section className="w-full max-w-7xl mx-auto">
      <div className="border border-gray-200 shadow-lg rounded-lg overflow-hidden">
        <div className="bg-gray-50 p-4">
          <CartDisplay functionCallOutput={cartProducts} />
        </div>
      </div>
    </section>
  );
}
