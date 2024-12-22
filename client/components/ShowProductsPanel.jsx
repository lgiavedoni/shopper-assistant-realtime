import { useEffect } from 'react';
import { useFunctionCall } from '../hooks/useFunctionCall';
import { useSession } from '../context/SessionContext';

const productSearchTool = {
  type: "function",
  name: "display_products_search_results",
  description: `Call this function every time that you are mentioning specific products to the user. 
                If the user asks for a product,category or similar, call this function.
                If you are mentioning a product or a list of products, call this function.
                If a function returns a product or many products, call this function.`,
  parameters: {
    type: "object",
    strict: true,
    properties: {
      products: {
        type: "array",
        description: "Array of 1 or more products.",
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

function ProductDisplay({ functionCallOutput }) {
  const { products } = JSON.parse(functionCallOutput.arguments);
  
  return (
    <div className="flex flex-col gap-2">
      <p>Customer Request</p>
      {products.map((product) => (
        <div
          key={product.name}
          className="w-full p-4 rounded-md flex items-center justify-between border border-gray-200 bg-white"
        >
          <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded" />
          <div className="flex flex-col flex-1 mx-4">
            <p className="font-bold">{product.name}</p>
            <p className="text-sm text-gray-600">{product.description}</p>
          </div>
          <p className="font-bold text-green-600">{product.price}</p>
        </div>
      ))}
    </div>
  );
}

export default function ShowProductsPanel({ isSessionActive, sendClientEvent, events }) {
  const { registerTool } = useSession();
  
  useEffect(() => {
    registerTool(productSearchTool);
  }, []);

  const functionCallOutput = useFunctionCall({
    functionName: productSearchTool.name,
    isSessionActive,
    events,
    processedFlag: 'processedProducts',
    afterFunctionCall: () => {
      sendClientEvent({
        type: "response.create",
        response: {
          instructions: `
          ask for feedback about the presented products - don't repeat 
          the products, just ask if they like the products.
          `,
        },
      });
    }
  });

  return (
    <section className="h-full w-full flex flex-col gap-4">
      <div className="h-full bg-gray-50 rounded-md p-4">
        <h2 className="text-lg font-bold">Show Products Tool</h2>
        {isSessionActive ? (
          functionCallOutput ? (
            <ProductDisplay functionCallOutput={functionCallOutput} />
          ) : (
            <p>Ask for product recomendations...</p>
          )
        ) : (
          <p>Start the session to use this tool...</p>
        )}
      </div>
    </section>
  );
}
