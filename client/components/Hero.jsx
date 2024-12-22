import React from 'react';

export default function Hero() {
  return (
    <nav className="w-full">
      {/* Top bar */}
      <div className="bg-black text-white px-4 py-2 flex justify-between items-center">
        <div className="flex gap-6">
          <div className="flex items-center">News ▼</div>
          <div className="flex items-center">Awards ▼</div>
          <div className="flex items-center">Support ▼</div>
          <div className="flex items-center">Gift Cards</div>
        </div>
        
        <div className="flex items-center gap-6">
          <div>Fast, Free Shipping + 30-Day Returns ▼</div>
          <div className="flex items-center gap-4">
            <span>Account</span>
            <span>🇺🇸 EN</span>
            <span>Enable Accessibility</span>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="px-4 py-3 flex justify-between items-center border-b">
        <div className="font-bold text-2xl">GoPro</div>
        <div className="flex gap-8">
          <div>Cameras</div>
          <div>Apps</div>
          <div>Accessories</div>
          <div>Lifestyle Gear</div>
          <div>GoPro Subscription</div>
          <div>Gift Guide</div>
        </div>
        <div className="flex gap-4">
          <button>🔍</button>
          <button>🛒</button>
        </div>
      </div>
    </nav>
  );
} 