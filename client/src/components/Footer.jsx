import { Link } from "react-router";
import { Search, Mail, MapPin, Heart, ArrowUpRight } from "lucide-react";
import { FaFacebookF, FaInstagramSquare, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 py-14 lg:py-16">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-flex items-center gap-2 mb-5">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <Search size={23} />
              </div>

              <h2 className="text-2xl font-bold text-white tracking-tight">
                Campus<span className="text-blue-500">Find</span>
                <span className="text-blue-500">.</span>
              </h2>
            </Link>

            <p className="text-sm leading-7 text-gray-400 max-w-xs">
              Helping students find what they've lost and return what they've
              found. Building a connected and helpful campus community together.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 mt-6">
              <a
                href="#"
                aria-label="Facebook"
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-800 text-gray-300 hover:bg-blue-600 hover:text-white transition"
              >
                <FaFacebookF />
              </a>

              <a
                href="#"
                aria-label="Instagram"
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-800 text-gray-300 hover:bg-pink-600 hover:text-white transition"
              >
                <FaInstagramSquare />
              </a>

              <a
                href="#"
                aria-label="LinkedIn"
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-800 text-gray-300 hover:bg-blue-700 hover:text-white transition"
              >
                <FaLinkedin />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-base mb-5">
              Quick Links
            </h3>

            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/" className="hover:text-blue-400 transition">
                  Home
                </Link>
              </li>

              <li>
                <Link
                  to="/lost-items"
                  className="hover:text-blue-400 transition"
                >
                  Lost Items
                </Link>
              </li>

              <li>
                <Link
                  to="/found-items"
                  className="hover:text-blue-400 transition"
                >
                  Found Items
                </Link>
              </li>

              <li>
                <Link to="/about" className="hover:text-blue-400 transition">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold text-base mb-5">
              Our Services
            </h3>

            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/post-lost-item"
                  className="hover:text-blue-400 transition"
                >
                  Report Lost Item
                </Link>
              </li>

              <li>
                <Link
                  to="/post-found-item"
                  className="hover:text-blue-400 transition"
                >
                  Report Found Item
                </Link>
              </li>

              <li>
                <Link to="/my-posts" className="hover:text-blue-400 transition">
                  My Posts
                </Link>
              </li>

              <li>
                <Link to="/contact" className="hover:text-blue-400 transition">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-base mb-5">
              Get In Touch
            </h3>

            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Mail size={18} className="text-blue-500 shrink-0 mt-0.5" />

                <a
                  href="mailto:support@campus-find.com"
                  className="hover:text-blue-400 transition"
                >
                  support@campus-find.com
                </a>
              </li>

              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-blue-500 shrink-0 mt-0.5" />

                <span>Rajshahi, Bangladesh</span>
              </li>

              <li className="flex items-start gap-3">
                <Heart size={18} className="text-blue-500 shrink-0 mt-0.5" />

                <span>Built for Campus Communities</span>
              </li>
            </ul>

            {/* CTA */}
            <Link
              to="/posts"
              className="inline-flex items-center gap-2 mt-6 text-sm font-semibold text-blue-400 hover:text-blue-300 transition"
            >
              Explore Lost Items
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 text-center">
              © {currentYear} CampusFind. All rights reserved.
            </p>

            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link to="/privacy" className="hover:text-blue-400 transition">
                Privacy Policy
              </Link>

              <Link to="/terms" className="hover:text-blue-400 transition">
                Terms of Service
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-gray-600 mt-5">
            Made with <span className="text-red-500">♥</span> for students, by
            the campus community.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
