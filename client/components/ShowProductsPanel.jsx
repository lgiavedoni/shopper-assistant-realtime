import { useEffect } from 'react';
import { useFunctionCall } from '../hooks/useFunctionCall';
import { useSession } from '../context/SessionContext';

const productSearchTool = {
  type: "function",
  name: "display_products_search_results",
  description: `Call this function every time that you are mentioning specific products to the user. 
                This is your PLP, Product Listing Page.
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
  console.log("ProductDisplay.INPUT", functionCallOutput);
  const { products } = JSON.parse(functionCallOutput.arguments);
  
  return (
    <div className="flex flex-row items-center gap-4">
      {/* <div className="shrink-0">
        <p className="font-bold">Customer Request</p>
      </div> */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4">
          {products.map((product) => (
            <div
              key={product.name}
              className="shrink-0 w-[300px] p-4 rounded-md flex items-center justify-between border border-gray-200 bg-white"
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
      </div>
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
    <section className="w-full">
      <div className="bg-gray-50 rounded-md p-4">
        <h2 className="text-lg font-bold mb-4">Show Products Tool</h2>
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
