import { Shield, Lock, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#2c2c2c] text-gray-300 mt-auto">
      {/* Main footer links */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-sm">
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">About Us</h4>
            <ul className="space-y-2">
              <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link to="/investor-relations" className="hover:text-white transition-colors">Investor Relations</Link></li>
              <li><Link to="/press" className="hover:text-white transition-colors">Press Releases</Link></li>
              <li><Link to="/community" className="hover:text-white transition-colors">Community</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Products</h4>
            <ul className="space-y-2">
              <li><Link to="/products/checking" className="hover:text-white transition-colors">Checking</Link></li>
              <li><Link to="/products/savings" className="hover:text-white transition-colors">Savings</Link></li>
              <li><Link to="/products/credit-cards" className="hover:text-white transition-colors">Credit Cards</Link></li>
              <li><Link to="/products/wire-transfer" className="hover:text-white transition-colors">Wire Transfer</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Security</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="hover:text-white transition-colors flex items-center gap-1"><Lock size={12} />Privacy Policy</Link></li>
              <li><Link to="/security-center" className="hover:text-white transition-colors flex items-center gap-1"><Shield size={12} />Security Center</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Use</Link></li>
              <li><Link to="/accessibility" className="hover:text-white transition-colors">Accessibility</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Help</h4>
            <ul className="space-y-2">
              <li><Link to="/customer-service" className="hover:text-white transition-colors flex items-center gap-1"><HelpCircle size={12} />Customer Service</Link></li>
              <li><Link to="/atm-locator" className="hover:text-white transition-colors">ATM & Branch Locator</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/faqs" className="hover:text-white transition-colors">FAQs</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-700">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400">
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
              <span>© {new Date().getFullYear()} Redwood Crest Bank, N.A.</span>
              <span>Member FDIC</span>
              <span>Equal Housing Lender</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <span className="text-gray-600">|</span>
              <Link to="/security-center" className="hover:text-white transition-colors">Security</Link>
              <span className="text-gray-600">|</span>
              <Link to="/accessibility" className="hover:text-white transition-colors">Accessibility</Link>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500 leading-relaxed text-center sm:text-left">
            Redwood Crest Bank, N.A. is a nationally chartered bank supervised by the Office of the Comptroller of the Currency.
            Deposit products are offered by Redwood Crest Bank, N.A. Member FDIC. Equal Housing Lender.
            NMLS ID 123456.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
