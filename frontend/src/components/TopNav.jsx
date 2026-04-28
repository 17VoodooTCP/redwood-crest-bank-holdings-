import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, LogOut, Search, User, ChevronDown, ChevronRight, Shield } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useState, useEffect } from 'react';
import api from '../services/api';
import BankLogo from './BankLogo';

const TopNav = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Accounts', path: '/' },
    { name: 'Pay & Transfer', path: '/transfer' },
    { name: 'Wire Transfer', path: '/wire' },
    { name: 'Activity', path: '/transactions' },
  ];

  return (
    <>
      {/* Topmost utility bar */}
      <div className="bg-[#f0f0f0] border-b border-gray-300 px-4 md:px-8 py-1 hidden sm:flex justify-end space-x-4 text-xs text-gray-600">
        <span className="cursor-pointer hover:underline">ATM & branch</span>
        <span className="cursor-pointer hover:underline">Customer service</span>
        <span className="cursor-pointer hover:underline" onClick={handleLogout}>Sign out</span>
      </div>

      {/* Main navigation bar */}
      <header className="bg-gradient-to-b from-[#0f2847] to-[#0A1E3F] text-white relative z-40 w-full" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.25), 0 1px 3px rgba(0,0,0,0.15)' }}>
        <div className="flex items-center justify-between px-2 sm:px-3 md:px-8 h-[72px] w-full min-w-0">
          
          <div className="flex items-center h-full space-x-2 min-w-0 shrink-0">
            <button className="lg:hidden p-1 focus:outline-none text-white shrink-0" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu size={22} />
            </button>
            <NavLink to="/" className="flex items-center h-full min-w-0" style={{ textDecoration: 'none' }}>
               <BankLogo size="nav" />
            </NavLink>
          </div>

          <nav className="hidden lg:flex items-center h-full space-x-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `px-4 h-full flex items-center font-medium transition-colors hover:bg-white/10 decoration-2 underline-offset-[14px] ${
                    isActive ? 'text-white underline decoration-white font-semibold' : 'text-blue-200'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center space-x-1 sm:space-x-2 shrink-0 min-w-0">
            {/* Full-width search pill only on lg+ where there's room beside the nav.
                Below lg, fall back to the icon-only button so the bar never overflows. */}
            <div
               className="relative hidden lg:block cursor-pointer"
               onClick={() => window.dispatchEvent(new CustomEvent('open-assistant'))}
            >
              <div className="bg-white/10 hover:bg-white/20 text-white transition-colors rounded-full px-4 py-1.5 flex items-center space-x-2">
                <Search size={16} />
                <span className="text-sm font-medium">How can we help?</span>
              </div>
            </div>

            <button
              className="lg:hidden p-1 text-white"
              onClick={() => window.dispatchEvent(new CustomEvent('open-assistant'))}
              aria-label="Open assistant"
            >
               <Search size={18} />
            </button>

            <div className="relative">
               <div
                 className="flex items-center space-x-1 border-l border-white/20 pl-1.5 sm:pl-2 md:pl-4 cursor-pointer group"
                 onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
               >
                 <User size={20} className="text-blue-200 group-hover:text-white transition-colors" />
                 <span className="text-sm font-medium hidden md:block text-white transition-colors">{user?.firstName}</span>
                 <ChevronDown size={16} className={`text-blue-200 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
               </div>

               {isProfileMenuOpen && (
                 <>
                   <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)}></div>
                   <div className="absolute top-full right-0 mt-6 w-[min(320px,calc(100vw-1rem))] bg-white rounded-md shadow-xl border border-gray-200 z-50 overflow-hidden text-gray-800">
                     <div className="px-5 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                        <div>
                          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Signed In As</p>
                          <p className="font-semibold text-brand-text text-lg truncate max-w-[150px]">{user?.firstName} {user?.lastName}</p>
                        </div>
                        <button 
                          onClick={handleLogout}
                          className="text-xs font-semibold text-white bg-brand-blue hover:bg-blue-800 px-4 py-2 rounded transition-colors"
                        >
                          Sign out
                        </button>
                     </div>
                     <div className="py-2">
                        <NavLink to="/settings" onClick={() => setIsProfileMenuOpen(false)} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer group transition-colors">
                           <span className="text-sm text-gray-700 font-medium group-hover:text-brand-blue">Profile & settings</span>
                           <ChevronRight size={16} className="text-gray-400 group-hover:text-brand-blue" />
                        </NavLink>
                        <NavLink to="/security" onClick={() => setIsProfileMenuOpen(false)} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer group transition-colors">
                           <span className="text-sm text-gray-700 font-medium group-hover:text-brand-blue">Security center</span>
                           <ChevronRight size={16} className="text-gray-400 group-hover:text-brand-blue" />
                        </NavLink>
                        <NavLink to="/settings" onClick={() => setIsProfileMenuOpen(false)} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer group transition-colors">
                           <span className="text-sm text-gray-700 font-medium group-hover:text-brand-blue">Account alerts</span>
                           <ChevronRight size={16} className="text-gray-400 group-hover:text-brand-blue" />
                        </NavLink>
                        <NavLink to="/messages" onClick={() => setIsProfileMenuOpen(false)} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer group transition-colors">
                           <span className="text-sm text-gray-700 font-medium group-hover:text-brand-blue flex items-center gap-2">
                             Messages
                             <span className="bg-brand-blue text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">3</span>
                           </span>
                           <ChevronRight size={16} className="text-gray-400 group-hover:text-brand-blue" />
                        </NavLink>
                        <NavLink to="/settings" onClick={() => setIsProfileMenuOpen(false)} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer group transition-colors">
                           <span className="text-sm text-gray-700 font-medium group-hover:text-brand-blue">Paperless</span>
                           <ChevronRight size={16} className="text-gray-400 group-hover:text-brand-blue" />
                        </NavLink>
                        {user?.isAdmin && (
                           <NavLink to="/admin" onClick={() => setIsProfileMenuOpen(false)} className="px-5 py-3 flex items-center justify-between hover:bg-red-50 cursor-pointer group transition-colors border-t border-gray-100">
                             <span className="text-sm text-red-600 font-semibold group-hover:text-red-700 flex items-center gap-2">
                               <Shield size={14} />
                               Admin Console
                             </span>
                             <ChevronRight size={16} className="text-red-400 group-hover:text-red-600" />
                           </NavLink>
                         )}
                     </div>
                   </div>
                 </>
               )}
            </div>

            <button className="lg:hidden p-1 text-blue-200 hover:text-white" onClick={handleLogout} aria-label="Sign out">
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Mobile / tablet menu (visible up through md) */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white text-brand-text border-b border-gray-200 absolute w-full shadow-lg z-50">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-3 border-b border-gray-100 ${
                    isActive ? 'bg-gray-50 text-brand-blue font-medium' : 'text-gray-700'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
            <div 
              className="px-4 py-3 text-gray-700 cursor-pointer"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-assistant'));
                setIsMenuOpen(false);
              }}
            >
              Search & Assistant
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default TopNav;
