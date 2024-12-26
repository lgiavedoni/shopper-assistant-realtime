import React from 'react';

export default function Hero() {
  // Add state for mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <nav className="w-full">
      {/* Top bar */}
      <div className="bg-black text-white px-4 py-2">
        {/* Hide on mobile, use flex on medium screens and up */}
        <div className="hidden md:flex justify-between items-center">
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
      </div>

      {/* Main navigation */}
      <div className="px-4 py-3 flex justify-between items-center border-b">
        <img 
          src="/assets/logo.png" 
          alt="GoPro" 
          className="h-12" // Adjust height as needed
        />
        
        {/* Desktop menu */}
        <div className="hidden md:flex gap-8">
          <div className="font-semibold text-lg">Cameras</div>
          <div className="font-semibold text-lg">Apps</div>
          <div className="font-semibold text-lg">Accessories</div>
          <div className="font-semibold text-lg">Lifestyle Gear</div>
          <div className="font-semibold text-lg">GoPro Subscription</div>
          <div className="font-semibold text-lg">Gift Guide</div>
        </div>

        <div className="flex gap-4 items-center">
          {/* Mobile menu button */}
          <button 
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            ☰
          </button>
          <button>🔍</button>
          <button>🛒</button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b">
          <div className="flex flex-col py-4">
            <div className="px-4 py-2 font-semibold text-lg">Cameras</div>
            <div className="px-4 py-2 font-semibold text-lg">Apps</div>
            <div className="px-4 py-2 font-semibold text-lg">Accessories</div>
            <div className="px-4 py-2 font-semibold text-lg">Lifestyle Gear</div>
            <div className="px-4 py-2 font-semibold text-lg">GoPro Subscription</div>
            <div className="px-4 py-2 font-semibold text-lg">Gift Guide</div>
            <div className="px-4 py-2">News</div>
            <div className="px-4 py-2">Awards</div>
            <div className="px-4 py-2">Support</div>
            <div className="px-4 py-2">Gift Cards</div>
            <div className="px-4 py-2">Account</div>
            <div className="px-4 py-2">🇺🇸 EN</div>
            <div className="px-4 py-2">Enable Accessibility</div>
          </div>
        </div>
      )}
    </nav>
  );
} 