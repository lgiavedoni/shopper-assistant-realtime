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
    required: ["products"],
  },
};

function CartDisplay({ functionCallOutput }) {
  const { products } = JSON.parse(functionCallOutput.arguments);
  
  return (
    <div className="flex flex-row items-center gap-4">
      <div className="shrink-0">
        <p className="font-bold">Your Cart</p>
      </div>
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4">
          {products.map((product) => (
            <div
              key={product.name}
              className="shrink-0 w-[250px] p-3 rounded-md flex items-center justify-between border border-gray-200 bg-white"
            >
              <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded" />
              <p className="font-bold flex-1 mx-3">{product.name}</p>
              <p className="font-bold text-green-600">{product.price}</p>
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
    <section className="w-full">
      <div className="bg-gray-50 rounded-md p-4">
        <h2 className="text-lg font-bold mb-4">Shopping Cart</h2>
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
