import { Link } from 'react-router-dom';
import { PRODUCT_IMAGES, ACTIVITY_IMAGES } from '../assets/images';

const NEW_PRODUCTS = [
  {
    title: "HERO13 Black Creator Edition",
    image: "/assets/hero13-creator.webp",
    link: "/shop-now"
  },
  {
    title: "Ultra Wide Lens Mod",
    image: "/assets/ultra-wide-lens.webp",
    link: "/shop-now"
  }
];

const ACTIVITIES = [
  { name: "SKI", image: "/assets/activities/ski.webp" },
  { name: "SNOWBOARD", image: "/assets/activities/snowboard.webp" },
  { name: "TRAVEL + ADVENTURE", image: "/assets/activities/travel.webp" },
  { name: "DIVE + SNORKEL", image: "/assets/activities/dive.webp" },
  { name: "SURF", image: "/assets/activities/surf.webp" },
  { name: "MOTO", image: "/assets/activities/moto.webp" },
  { name: "POWER-SPORTS", image: "/assets/activities/power-sports.webp" }
];

export default function HomePanel() {
  return (
    <div className="w-full">
      {/* New Products Section */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {NEW_PRODUCTS.map((product, index) => (
          <div key={index} className="relative group">
            <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-gray-100">
              <img 
                src={product.image} 
                alt={product.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-xl font-bold mb-4">{product.title}</h3>
              <button
                onClick={() => {}} // You can add click handler here
                className="inline-block bg-black text-white px-8 py-2 rounded hover:bg-gray-800 transition-colors"
              >
                SHOP NOW
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Shop by Activity Section */}
      <div>
        <h2 className="text-2xl font-bold text-center mb-6">Shop by Activity</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {ACTIVITIES.map((activity, index) => (
            <div 
              key={index} 
              className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group bg-gray-100"
            >
              <img 
                src={activity.image} 
                alt={activity.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end p-4">
                <span className="text-white font-bold">
                  {activity.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 