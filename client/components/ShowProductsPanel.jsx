import { useEffect, useState } from 'react';
import { useFunctionCall } from '../hooks/useFunctionCall';
import { useSession } from '../context/SessionContext';
import { WidthProvider, Responsive } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const productSearchTool = {
  type: "function",
  name: "display_products_search_results",
  description: `Call this function every time that you are mentioning specific product/s to the user. 
                This is your PLP, Product Listing Page.
                If the user asks for a product,category or similar, call this function.
                If you are mentioning a product or a list of products, call this function.
                If you are mentioning some recommendations, call this function.
                If a function returns a product or many products, call this function.
                Include the price in the product object. If you don't have the exact price use your best guess.`,
  parameters: {
    type: "object",
    strict: true,
    properties: {
      title: {
        type: "string",
        description: "The title of the products to display. For example: 'Accessories for your Hero 11 camera'",
      },
      products: {
        type: "array",
        description: "Array of 1 or more products.",
        items: {
          type: "object",
          properties: {
            "name": { "type": "string", },
            "description": { "type": "string" },
            "price": { "type": "string"},
            "image": { "type": "string" },
            // "features": { "type": "string" },
          },
        },
      },
    },
    required: ["products",  "price", "image"],
  },
};

// Create a responsive grid layout
const ResponsiveGridLayout = WidthProvider(Responsive);

function ProductDisplay({ functionCallOutput }) {
  const { products, title } = JSON.parse(functionCallOutput.arguments);
  
  // Return null if no products
  if (!products || products.length === 0) {
    return null;
  }

  const generateLayout = () => {
    if (products.length === 1) {
      return [{ i: '0', x: 0, y: 0, w: 12, h: 3 }];
    }
    
    if (products.length === 2) {
      return [
        { i: '0', x: 0, y: 0, w: 6, h: 3 },
        { i: '1', x: 6, y: 0, w: 6, h: 3 }
      ];
    }
    
    return products.map((_, index) => {
      if (index === products.length - 1 && products.length % 2 !== 0) {
        return { i: index.toString(), x: 0, y: Math.floor(index/2), w: 12, h: 3 };
      }
      return {
        i: index.toString(),
        x: (index % 2) * 6,
        y: Math.floor(index/2),
        w: 6,
        h: 3
      };
    });
  };

  const layouts = {
    lg: generateLayout(),
    md: generateLayout(),
    sm: products.map((_, index) => ({ 
      i: index.toString(), 
      x: 0, 
      y: index, 
      w: 12, 
      h: 2 
    }))
  };

  return (
    <div className="w-full h-full overflow-auto">
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768 }}
        cols={{ lg: 12, md: 12, sm: 12 }}
        rowHeight={100}
        margin={[8, 8]}
        isDraggable={false}
        isResizable={false}
        compactType="vertical"
        containerPadding={[0, 0]}
        autoSize={true}
      >
        {products.map((product, index) => (
          <div
            key={index.toString()}
            className="relative group overflow-hidden rounded-lg bg-white hover:shadow-xl transition-shadow duration-300 p-2"
          >
            <div 
              className="absolute inset-0 bg-center bg-no-repeat bg-contain"
              style={{
                backgroundImage: `url(${product.image})`,
                backgroundPosition: 'center',
                zIndex: 0
              }}
            />
            <div className="absolute bottom-2 left-2 z-10">
              <div className="p-2 bg-white/80 rounded-lg max-w-fit">
                <h3 className="text-base font-bold mb-1">{product.name}</h3>
                <p className="text-gray-600 text-xs line-clamp-2 max-w-[180px]">{product.description}</p>
                <p className="text-xl font-bold text-green-600 mt-1">{product.price}</p>
              </div>
            </div>
          </div>
        ))}
      </ResponsiveGridLayout>
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

  // Don't render anything if there are no products
  if (!functionCallOutput || !JSON.parse(functionCallOutput.arguments).products?.length) {
    return null;
  }

  return (
    <section className="w-full h-full overflow-hidden">
      <div className="border border-gray-200 shadow-lg rounded-lg overflow-hidden">
        <div className="bg-gray-50 p-4 h-full flex flex-col">
          <h2 className="text-lg font-bold mb-4">
            {JSON.parse(functionCallOutput.arguments).title}
          </h2>
          <div className="flex-1 overflow-auto">
            <ProductDisplay functionCallOutput={functionCallOutput} />
          </div>
        </div>
      </div>
    </section>
  );
}
