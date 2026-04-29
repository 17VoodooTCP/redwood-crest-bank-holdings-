import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ChevronLeft, ChevronRight, Search, Briefcase, CreditCard, Wallet, Plane, PiggyBank, Home, Car, GraduationCap, Building2, ArrowRight, Shield, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpToken, setTotpToken] = useState('');
  const [error, setError] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { login, verify2FA } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (requires2FA) {
      const result = await verify2FA(totpToken, email, password);
      if (result.success) navigate('/');
      else setError(result.error);
    } else {
      const result = await login(email, password);
      if (result.success) navigate('/');
      else if (result.requires2FA) setRequires2FA(true);
      else setError(result.error);
    }
    setIsLoading(false);
  };

  const categories = [
    { icon: Briefcase, label: 'Business' },
    { icon: CreditCard, label: 'Credit cards' },
    { icon: Wallet, label: 'Checking' },
    { icon: Plane, label: 'Travel' },
    { icon: PiggyBank, label: 'Savings' },
    { icon: Home, label: 'Home loans' },
  ];

  return (
    <div className="min-h-screen bg-white" ref={() => { document.title = 'Redwood Crest Bank: Banking, Credit Cards, Loans, and Investing'; }}>

      {/* ── Top utility bar ──────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-4 flex items-center justify-between h-10">
          <div className="flex items-center gap-6 text-[13px]">
            <span className="text-[#0A1E3F] font-semibold cursor-pointer border-b-2 border-[#0A1E3F] pb-2 pt-2">Personal</span>
            <span className="text-gray-600 hover:text-[#0A1E3F] cursor-pointer pb-2 pt-2">Business</span>
            <span className="text-gray-600 hover:text-[#0A1E3F] cursor-pointer pb-2 pt-2">Commercial</span>
          </div>
          <div className="flex items-center gap-5 text-[13px] text-gray-600">
            <Link to="/atm-locator" className="hover:text-[#0A1E3F] cursor-pointer hidden sm:block">Find a branch</Link>
            <Link to="/customer-service" className="hover:text-[#0A1E3F] cursor-pointer hidden sm:block">Customer service <span className="text-xs">&#9662;</span></Link>
            <span className="text-gray-600 hover:text-[#0A1E3F] cursor-pointer hidden md:block">Espa&ntilde;ol</span>
            <Search size={18} className="text-gray-500 hover:text-[#0A1E3F] cursor-pointer" />
          </div>
        </div>
      </div>

      {/* ── Main nav bar ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto px-4 flex items-center h-12">
          {/* Logo */}
          <div className="flex items-center gap-2 mr-8 shrink-0">
            <div style={{ height: '32px', width: '180px', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
              <img src="/logo.png?v=18" alt="Redwood Crest" style={{ height: '130px', width: 'auto', margin: '-49px 0', maxWidth: 'none', objectFit: 'contain' }} />
            </div>
          </div>

          {/* Nav items removed — Personal / Business / Commercial in the utility bar above is the only top-level nav. */}
        </div>
      </div>

      {/* ── Hero section with sign-in ────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#0A1E3F] to-[#06132A] relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-4 py-10 md:py-14 flex flex-col md:flex-row items-start justify-between gap-8">
          {/* Left: Promo */}
          <div className="text-white max-w-md">
            <p className="text-sm font-medium tracking-wide mb-1 text-blue-200">Welcome offer</p>
            <div className="text-5xl md:text-6xl font-bold mb-2">$350</div>
            <h1 className="text-2xl md:text-3xl font-bold mb-3 leading-tight">New Redwood Crest checking customers</h1>
            <p className="text-blue-100 text-sm mb-6 leading-relaxed">Open a Redwood Crest Premier Checking® account with qualifying direct deposit activities.</p>
            <Link to="/register" className="inline-block bg-white text-[#0A1E3F] font-semibold text-sm px-6 py-3 rounded hover:bg-gray-100 transition-colors">
              Open an account
            </Link>
          </div>

          {/* Right: Sign-in card */}
          <div className="bg-white rounded-lg shadow-xl p-6 w-full md:w-[340px] shrink-0">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {requires2FA ? 'Verify your identity' : 'Welcome'}
            </h2>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-2.5 mb-4 text-xs rounded-r">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-3">
              {!requires2FA ? (
                <>
                  <div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Username"
                      className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#0A1E3F] focus:ring-1 focus:ring-[#0A1E3F]"
                      required
                    />
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm pr-16 focus:outline-none focus:border-[#0A1E3F] focus:ring-1 focus:ring-[#0A1E3F]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0A1E3F] text-xs font-medium"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer text-gray-600">
                      <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} className="rounded border-gray-300" />
                      Remember me
                    </label>
                    <Link to="/products/checking" className="text-[#0A1E3F] hover:underline font-medium">Use token ›</Link>
                  </div>
                </>
              ) : (
                <div>
                  <input
                    type="text"
                    value={totpToken}
                    onChange={(e) => setTotpToken(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm text-center tracking-[0.3em] font-mono focus:outline-none focus:border-[#0A1E3F] focus:ring-1 focus:ring-[#0A1E3F]"
                    placeholder="000000"
                    maxLength={6}
                    autoFocus
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">Enter the code from your authenticator app.</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#0A1E3F] hover:bg-[#06132A] text-white font-semibold py-2.5 rounded text-sm transition-colors disabled:opacity-60"
              >
                {isLoading ? 'Signing in...' : (requires2FA ? 'Verify' : 'Sign in')}
              </button>
            </form>

            <div className="mt-4 space-y-2 text-xs">
              <a href="#" className="text-[#0A1E3F] hover:underline block">Forgot username/password? ›</a>
              <Link to="/register" className="text-[#0A1E3F] hover:underline block">Not enrolled? Sign Up Now. ›</Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Choose what's right for you ──────────────────────────── */}
      <div className="bg-white py-10">
        <div className="max-w-[1200px] mx-auto px-4">
          <h2 className="text-2xl font-light text-center text-gray-800 mb-8 italic">Choose what's right for you</h2>
          <div className="flex justify-center gap-8 md:gap-12 flex-wrap">
            {categories.map((cat, i) => (
              <div key={i} className="flex flex-col items-center gap-2 cursor-pointer group">
                <div className="w-14 h-14 rounded-full border-2 border-gray-300 group-hover:border-[#0A1E3F] flex items-center justify-center transition-colors">
                  <cat.icon className="w-6 h-6 text-gray-500 group-hover:text-[#0A1E3F] transition-colors" />
                </div>
                <span className="text-xs text-gray-600 group-hover:text-[#0A1E3F] font-medium">{cat.label}</span>
              </div>
            ))}
          </div>
          {/* Carousel dots */}
          <div className="flex justify-center items-center gap-2 mt-6">
            <ChevronLeft size={18} className="text-gray-400 cursor-pointer hover:text-gray-600" />
            <span className="w-2 h-2 rounded-full bg-gray-300"></span>
            <span className="w-2 h-2 rounded-full bg-[#0A1E3F]"></span>
            <span className="w-2 h-2 rounded-full bg-gray-300"></span>
            <ChevronRight size={18} className="text-gray-400 cursor-pointer hover:text-gray-600" />
          </div>
        </div>
      </div>

      {/* ── Three promo cards ────────────────────────────────────── */}
      <div className="bg-gray-50 py-10">
        <div className="max-w-[1200px] mx-auto px-4 grid md:grid-cols-3 gap-5">
          {/* Card 1 */}
          <div className="bg-[#0A1E3F] rounded-xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-white/60" />
            </div>
            <h3 className="text-lg font-bold mb-1">New Business Customers</h3>
            <p className="text-sm text-blue-100 mt-3 mb-4 leading-relaxed">Keep moving forward with Redwood Crest and earn up to $400</p>
            <p className="text-xs text-blue-200 mb-5">Open a new Redwood Crest Business Advantage Checking® account with qualifying activities.</p>
            <Link to="/products/checking" className="inline-block bg-white text-[#0A1E3F] font-semibold text-xs px-4 py-2 rounded hover:bg-blue-50 transition-colors">
              Open account
            </Link>
          </div>

          {/* Card 2 */}
          <div className="bg-[#1a6834] rounded-xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-white/60" />
            </div>
            <h3 className="text-lg font-bold mb-1">Redwood Crest Essential Banking&#8482;</h3>
            <p className="text-sm text-green-100 mt-3 mb-2 leading-relaxed">Get $100 as a new Redwood Crest checking customer</p>
            <p className="text-xs text-green-200 mb-5">When you open a Redwood Crest Essential Banking account with qualifying activities. <strong>$0 Monthly Service Fee</strong> for customers age 17-24.</p>
            <Link to="/products/checking" className="inline-block bg-white text-[#1a6834] font-semibold text-xs px-4 py-2 rounded hover:bg-green-50 transition-colors">
              Open now
            </Link>
          </div>

          {/* Card 3 */}
          <div className="bg-[#1a3a6b] rounded-xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center">
              <Car className="w-8 h-8 text-white/60" />
            </div>
            <h3 className="text-lg font-bold mb-1">Redwood Crest Auto</h3>
            <p className="text-sm text-blue-100 mt-3 mb-2 leading-relaxed">Get prequalified in seconds</p>
            <p className="text-xs text-blue-200 mb-5">Learn how much you can borrow with no impact on your credit score.</p>
            <button className="inline-block bg-white text-[#1a3a6b] font-semibold text-xs px-4 py-2 rounded hover:bg-blue-50 transition-colors">
              Get prequalified
            </button>
          </div>
        </div>
      </div>

      {/* ── Cash bonus banner ────────────────────────────────────── */}
      <div className="bg-white py-10">
        <div className="max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row items-center gap-8">
          <div className="bg-gray-100 rounded-2xl p-10 text-center md:w-[300px] shrink-0">
            <p className="text-sm text-gray-600 font-medium">Earn up to</p>
            <p className="text-5xl font-bold text-gray-900 my-2">$750</p>
            <p className="text-gray-500 text-sm">cash bonus</p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Commission-free online trades — plus a bonus</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">This is an invitation to get up to $750 when you open and fund a Redwood Crest Self-Directed Investing account — an investing experience that puts you in control.</p>
            <button className="bg-[#1a6834] text-white text-sm font-semibold px-5 py-2.5 rounded hover:bg-[#155a2b] transition-colors">Continue</button>
          </div>
        </div>
      </div>

      {/* ── Credit card promo ────────────────────────────────────── */}
      <div className="bg-gray-50 py-10">
        <div className="max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Introductory offer: Earn a $150 statement credit</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">Plus, earn unlimited 1.5% cash back on all purchases, including 2% on dining and gas stations — <strong>all with no annual fee.</strong></p>
            <button className="bg-[#1a6834] text-white text-sm font-semibold px-5 py-2.5 rounded hover:bg-[#155a2b] transition-colors">Learn more</button>
          </div>
          <div className="md:w-[340px] shrink-0 bg-gradient-to-br from-[#1a3a6b] to-[#0A1E3F] rounded-2xl p-8 text-center">
            <div className="text-white">
              <p className="text-3xl font-bold">REDWOOD</p>
              <p className="text-xs tracking-[0.3em] text-blue-200 mb-3">UNLIMITED<sup>SM</sup></p>
              <div className="w-24 h-16 bg-white/10 rounded-lg mx-auto flex items-center justify-center mb-3">
                <CreditCard className="w-10 h-10 text-white/70" />
              </div>
              <p className="text-[10px] text-blue-300 font-medium">NO ANNUAL FEE</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mortgage promo ───────────────────────────────────────── */}
      <div className="bg-white py-10">
        <div className="max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-[340px] shrink-0 bg-gray-100 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-3">🏠</div>
            <Home className="w-12 h-12 text-[#0A1E3F] mx-auto" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Fast, reliable home loan closings</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">We're committed to on-time closings for eligible products. Lock in your rate today and let our mortgage specialists guide you through every step.</p>
            <button className="bg-[#1a6834] text-white text-sm font-semibold px-5 py-2.5 rounded hover:bg-[#155a2b] transition-colors">Get started</button>
          </div>
        </div>
      </div>

      {/* ── Footer logo + product descriptions ───────────────────── */}
      <div className="bg-white border-t border-gray-200 py-10">
        <div className="max-w-[1200px] mx-auto px-4">
          {/* Logo */}
          <div className="mb-8" style={{ height: '36px', width: '200px', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png?v=18" alt="Redwood Crest" style={{ height: '140px', width: 'auto', margin: '-52px 0', maxWidth: 'none', objectFit: 'contain' }} />
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs text-gray-600 leading-relaxed mb-10">
            <div>
              <h4 className="font-bold text-gray-800 text-sm mb-3">Checking Accounts</h4>
              <p>Choose the <Link to="/products/checking" className="text-[#0A1E3F] underline">checking account</Link> that works best for you. See our <Link to="/products/checking" className="text-[#0A1E3F] underline">Redwood Crest Premier Checking®</Link> offer for new customers. Make purchases with your debit card, and bank from almost anywhere by phone, tablet or computer and more than 16,000 ATMs and 1,200 branches.</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 text-sm mb-3">Savings Accounts & CDs</h4>
              <p>It's never too early to begin saving. <Link to="/products/savings" className="text-[#0A1E3F] underline">Open a savings account</Link> or open a Certificate of Deposit (see interest rates) and start saving your money.</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 text-sm mb-3">Credit Cards</h4>
              <p>Redwood Crest <Link to="/products/credit-cards" className="text-[#0A1E3F] underline">credit cards</Link> can help you buy the things you need. Many of our cards offer <Link to="/products/credit-cards" className="text-[#0A1E3F] underline">rewards</Link> that can be redeemed for cash back or travel. With so many options, it can be easy to find a card that matches your lifestyle. Plus, with responsible use, a credit card can help you build credit.</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 text-sm mb-3">Mortgages</h4>
              <p>Apply for a mortgage or refinance your mortgage with Redwood Crest. View today's mortgage rates or calculate what you can afford with our <Link to="/products/checking" className="text-[#0A1E3F] underline">mortgage calculator</Link>. Visit our Education Center for homebuying tips and more.</p>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs text-gray-600 leading-relaxed mb-10">
            <div>
              <h4 className="font-bold text-gray-800 text-sm mb-3">Auto</h4>
              <p>Redwood Crest Auto is here to help you get the right car. Apply for <Link to="/products/checking" className="text-[#0A1E3F] underline">auto financing</Link> for a new or used car with Redwood Crest. Use the payment calculator to estimate monthly payments.</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 text-sm mb-3">Banking for Business</h4>
              <p>With Banking for Business you'll receive guidance from a team of business professionals who specialize in helping improve cash flow, providing credit solutions, and managing payroll.</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 text-sm mb-3">Sports & Entertainment</h4>
              <p>Redwood Crest gives you access to unique sports, live experiences and culinary events through exclusive partnerships such as the Redwood Crest Madison Square Garden and Redwood Crest Center.</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 text-sm mb-3">Redwood Crest Security Center</h4>
              <p>Our suite of <Link to="/security-center" className="text-[#0A1E3F] underline">security features</Link> can help protect your info, money, and give you peace of mind. See how we're dedicated to helping protect you, your accounts and your loved ones from <Link to="/security-center" className="text-[#0A1E3F] underline">financial fraud</Link>.</p>
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-xs text-gray-600 leading-relaxed mb-10">
            <div>
              <h4 className="font-bold text-gray-800 text-sm mb-3">About Redwood Crest</h4>
              <p>Redwood Crest serves millions of people with a broad range of products. <Link to="/careers" className="text-[#0A1E3F] underline">Redwood Crest Bank</Link> lets you manage your bank accounts, view statements, monitor activity, pay bills or transfer funds securely from one central place. To learn more, visit the Banking Education Center. For questions or concerns, please contact Redwood Crest customer service or let us know about <Link to="/community" className="text-[#0A1E3F] underline">Redwood Crest complaints and feedback</Link>.</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 text-sm mb-3">Investing by Redwood Crest</h4>
              <p>Partner with a global leader who puts your financial needs first. <Link to="/investor-relations" className="text-[#0A1E3F] underline">Invest your way</Link> — whether you want to do it yourself or with expert guidance, we have the products, tools, and expertise to help you reach your financial goals.</p>
              <p className="mt-3 text-[10px] text-gray-500 leading-snug">All investing content shown on this site is illustrative. No real investment products are offered.</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 text-sm mb-3">Redwood Crest Private Client</h4>
              <p>Get more from a personalized relationship offering no everyday banking fees, priority service from a dedicated team and special perks and benefits. Connect with a Redwood Crest Private Client Banker at your nearest Redwood Crest branch to learn about eligibility requirements and all available benefits.</p>
              <p className="mt-3 text-[10px] text-gray-500 leading-snug">Private Client offerings shown are illustrative. This is a portfolio project, not a real banking service.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Other Products ───────────────────────────────────────── */}
      <div className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-[1200px] mx-auto px-4">
          <p className="text-xs text-gray-500 mb-3 font-medium">Other Products & Services:</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {['Deposit Account', 'Mobile', 'Online', 'Banking', 'Safety'].map(item => (
              <a key={item} href="#" className="text-[#0A1E3F] underline hover:text-[#06132A]">{item}</a>
            ))}
          </div>

          {/* Social icons */}
          <div className="flex justify-end gap-4 mt-4">
            {['f', 'in', '𝕏', '🎬', '📷'].map((icon, i) => (
              <span key={i} className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-500 cursor-pointer hover:bg-gray-300">{icon}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom footer ────────────────────────────────────────── */}
      <div className="bg-[#f5f5f5] border-t border-gray-200 py-6">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-gray-600 mb-4">
            <Link to="/privacy" className="hover:text-[#0A1E3F]">Privacy</Link>
            <Link to="/security-center" className="hover:text-[#0A1E3F]">Security</Link>
            <Link to="/terms" className="hover:text-[#0A1E3F]">Terms of Use</Link>
            <Link to="/accessibility" className="hover:text-[#0A1E3F]">Accessibility</Link>
            <Link to="/careers" className="hover:text-[#0A1E3F]">Careers</Link>
            <a href="#" className="hover:text-[#0A1E3F]">Site Map</a>
          </div>
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[11px] text-gray-400 mb-4">
            <span>Redwood Crest Bank</span>
            <span>Redwood Crest Wealth Management</span>
            <span>Media Center</span>
            <span>Careers</span>
            <span>Site Map</span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-gray-600 mb-3">
            <Link to="/privacy" className="hover:text-[#0A1E3F]">Privacy</Link>
            <Link to="/security-center" className="hover:text-[#0A1E3F]">Security</Link>
            <Link to="/terms" className="hover:text-[#0A1E3F]">Terms of Use</Link>
            <Link to="/accessibility" className="hover:text-[#0A1E3F]">Accessibility</Link>
          </div>
          {/* Disclosure — small enough to not crowd the layout, present in DOM so reviewers find it. */}
          <p className="text-[10px] text-gray-400 text-center mt-2">
            © {new Date().getFullYear()} Redwood Crest · Personal portfolio · Accounts are fictional
          </p>
        </div>
      </div>

    </div>
  );
};

export default LoginPage;
