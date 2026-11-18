import { Link } from "react-router";
import { Search } from "lucide-react";
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";

const navLinks = [
  { label: "Lost Items", to: "/lost-items" },
  { label: "Found Items", to: "/found-items" },
  { label: "My Posts", to: "/my-posts" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

const socials = [
  { label: "Facebook", href: "#", Icon: FaFacebookF },
  { label: "Instagram", href: "#", Icon: FaInstagram },
  { label: "LinkedIn", href: "#", Icon: FaLinkedinIn },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top row */}
        <div className="flex flex-col items-center gap-6 py-8 md:flex-row md:justify-between">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Search size={18} />
            </span>
            <span className="text-lg font-bold tracking-tight text-gray-900">
              Campus<span className="text-blue-600">Find</span>
            </span>
          </Link>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-600">
              {navLinks.map(({ label, to }) => (
                <li key={to}>
                  <Link to={to} className="transition hover:text-blue-600">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-4 text-gray-500">
            {socials.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="transition hover:text-blue-600"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 py-5 text-xs text-gray-500 sm:flex-row">
          <p>© {currentYear} CampusFind. All rights reserved.</p>

          <div className="flex items-center gap-5">
            <Link to="/privacy" className="transition hover:text-blue-600">
              Privacy
            </Link>
            <Link to="/terms" className="transition hover:text-blue-600">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
