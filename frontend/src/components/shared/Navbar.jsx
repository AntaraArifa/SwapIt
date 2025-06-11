import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Skills', href: '/skills' },
    { name: 'About', href: '/about' },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="text-2xl font-bold text-gray-800">
            Swap<span className="text-indigo-600">IT</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-gray-600 hover:text-indigo-600 transition font-medium"
              >
                {item.name}
              </Link>
            ))}
            <Link
              to="/signin"
              className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition font-semibold"
            >
              Sign In
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-700 focus:outline-none"
            >
              {menuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="block text-gray-700 hover:text-indigo-600 transition font-medium"
              onClick={() => setMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <Link
            to="/signin"
            className="block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold text-center"
            onClick={() => setMenuOpen(false)}
          >
            Sign In
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
