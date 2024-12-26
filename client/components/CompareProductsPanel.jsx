import { useEffect } from 'react';
import { useFunctionCall } from '../hooks/useFunctionCall';
import { useSession } from '../context/SessionContext';

const productCompareTool = {
  type: "function",
  name: "display_product_comparison",
  description: `Call this function when the user wants to compare two products side by side.
                call this function when the user asks for the difference between two products.
                Use this for detailed feature comparison between products.`,
  parameters: {
    type: "object",
    strict: true,
    properties: {
      title: {
        type: "string",
        description: "The comparison title, e.g., 'GoPro HERO13 Black vs HERO Comparison'",
      },
      product_a: {
        type: "object",
        properties: {
          name: { type: "string" },
          price: { type: "string" },
          originalPrice: { type: "string" },
          image: { type: "string" },
          feature_1: { type: "string" },
          feature_2: { type: "string" },
          feature_3: { type: "string" },
          feature_4: { type: "string" },
          feature_5: { type: "string" }
        }
      },
      product_b: {
        type: "object",
        properties: {
          name: { type: "string" },
          price: { type: "string" },
          originalPrice: { type: "string" },
          image: { type: "string" },
          feature_1: { type: "string" },
          feature_2: { type: "string" },
          feature_3: { type: "string" },
          feature_4: { type: "string" },
          feature_5: { type: "string" }
        }
      },
      feature_names: {
        type: "object",
        properties: {
          feature_1: { type: "string" },
          feature_2: { type: "string" },
          feature_3: { type: "string" },
          feature_4: { type: "string" },
          feature_5: { type: "string" }
        }
      }
    },
    required: ["product_a", "product_b", "feature_names"]
  }
};

function ComparisonTable({ functionCallOutput }) {
  const { product_a, product_b, feature_names, title } = JSON.parse(functionCallOutput.arguments);
  const products = [product_a, product_b];
  const featureKeys = Object.keys(feature_names).filter(key => feature_names[key]);

  return (
    <div className="w-full flex flex-col gap-4">
      {title && <h2 className="text-xl font-bold">{title}</h2>}
      
      <div className="grid" style={{ gridTemplateColumns: `auto repeat(2, 1fr)` }}>
        {/* Product Headers */}
        <div className="col-start-2 col-span-full grid gap-4" style={{ gridTemplateColumns: `repeat(2, 1fr)` }}>
          {products.map((product, idx) => (
            <div key={idx} className="flex flex-col items-center gap-4 p-4 bg-white rounded-lg">
              <img src={product.image} alt={product.name} className="w-32 h-32 object-contain" />
              <h3 className="font-bold text-lg text-center">{product.name}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-green-600">{product.price}</span>
                {product.originalPrice && (
                  <span className="text-sm text-gray-400 line-through">{product.originalPrice}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Feature Comparisons */}
        {featureKeys.map((featureKey, idx) => (
          <div key={idx} className="contents">
            <div className="bg-gray-100 p-4 font-medium">{feature_names[featureKey]}</div>
            {products.map((product, productIdx) => (
              <div key={`${idx}-${productIdx}`} className="p-4 border-b border-gray-200">
                {product[featureKey]}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CompareProductsPanel({ isSessionActive, sendClientEvent, events }) {
  const { registerTool } = useSession();
  
  useEffect(() => {
    registerTool(productCompareTool);
  }, []);

  const functionCallOutput = useFunctionCall({
    functionName: productCompareTool.name,
    isSessionActive,
    events,
    processedFlag: 'processedComparison',
    afterFunctionCall: () => {
      sendClientEvent({
        type: "response.create",
        response: {
          instructions: "ask if the comparison helps with their decision - don't repeat the comparison details",
        },
      });
    }
  });

  if (!functionCallOutput) return null;
  
  try {
    const parsed = JSON.parse(functionCallOutput.arguments);
    if (!parsed.product_a || !parsed.product_b || !parsed.feature_names) return null;
  } catch (e) {
    console.error('Failed to parse comparison data:', e);
    console.log('functionCallOutput.arguments', functionCallOutput.arguments);
    return null;
  }

  return (
    <section className="w-full overflow-auto">
      <div className="bg-gray-50 rounded-md p-4">
        <ComparisonTable functionCallOutput={functionCallOutput} />
      </div>
    </section>
  );
} 