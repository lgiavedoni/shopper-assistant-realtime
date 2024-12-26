import { Link } from 'react-router-dom';

export default function FooterPanel() {
  const footerSections = [
    {
      title: "ABOUT",
      links: [
        { name: "Our Story", href: "#" },
        { name: "Careers", href: "#" },
        { name: "CSR", href: "#" },
        { name: "Diversity & Inclusion", href: "#" },
        { name: "Investors", href: "#" },
      ]
    },
    {
      title: "SHOP",
      links: [
        { name: "Cameras", href: "#" },
        { name: "Apps", href: "#" },
        { name: "Accessories", href: "#" },
        { name: "Lifestyle Gear", href: "#" },
        { name: "GoPro Subscription", href: "#" },
      ]
    },
    {
      title: "NEWS",
      links: [
        { name: "Latest News", href: "#" },
        { name: "GoPro Tips", href: "#" },
        { name: "World of GoPro", href: "#" },
        { name: "Heroes", href: "#" },
      ]
    },
    {
      title: "PROGRAMS",
      links: [
        { name: "GoPro Awards", href: "#" },
        { name: "GoPro for a Cause", href: "#" },
        { name: "GoPro Labs", href: "#" },
        { name: "VIP", href: "#" },
        { name: "Student Discount", href: "#" },
      ]
    },
    {
      title: "SUPPORT",
      links: [
        { name: "GoPro Support", href: "#" },
        { name: "Order Status", href: "#" },
        { name: "Contact Us", href: "#" },
        { name: "Warranty & Return", href: "#" },
        { name: "Policy", href: "#" },
      ]
    },
  ];

  return (
    <footer className="bg-[#232323] text-white px-6 py-12">
      {/* Newsletter Section */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Get exclusive offers and updates</h2>
            <p className="text-sm text-gray-400">
              By signing up, you agree to with GoPro's{' '}
              <a href="#" className="text-blue-400">Privacy Policy</a> and{' '}
              <a href="#" className="text-blue-400">Terms of Use</a>.
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 md:w-80 px-4 py-2 rounded bg-white text-black"
            />
            <button className="bg-black px-6 py-2 rounded font-bold">
              SIGN UP
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
        {footerSections.map((section) => (
          <div key={section.title}>
            <h3 className="font-bold mb-4">{section.title}</h3>
            <ul className="space-y-2">
              {section.links.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-gray-400 hover:text-white text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Expert Support Section
      <div className="max-w-7xl mx-auto mt-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="flex items-center gap-4">
          <span className="text-2xl">🎧</span>
          <div>
            <h3 className="font-bold text-lg">Shop with an Expert.</h3>
            <p className="text-gray-400">We're here to help.</p>
            <a href="tel:800-565-9566" className="text-white font-bold">
              CALL US: 800-565-9566
            </a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-2xl">📍</span>
          <div>
            <h3 className="font-bold text-lg">Store Finder</h3>
            <a href="#" className="text-white underline">
              Find a local store near you
            </a>
          </div>
        </div>
      </div> */}
    </footer>
  );
} 