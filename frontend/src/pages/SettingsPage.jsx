import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Save } from 'lucide-react';
import api from '../services/api';

const VerifiedBadge = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="#0095f6" className="shrink-0">
    <path d="M22.5 12.5c0-1.58-.8-3-2.04-3.84.2-1.58-.46-3.12-1.7-4.12-1-1.04-2.54-1.66-4.12-1.46-.84-1.24-2.26-2.04-3.84-2.04s-3 .8-3.84 2.04c-1.58-.2-3.12.42-4.12 1.46-1.04 1-1.66 2.54-1.46 4.12-1.24.84-2.04 2.26-2.04 3.84s.8 3 2.04 3.84c-.2 1.58.46 3.12 1.7 4.12 1 1.04 2.54 1.66 4.12 1.46.84 1.24 2.26 2.04 3.84 2.04s3-.8 3.84-2.04c1.58.2 3.12-.42 4.12-1.46 1.04-1 1.66-2.54 1.46-4.12 1.24-.84 2.04-2.26 2.04-3.84zM10.7 17l-4.5-4.5 1.4-1.4 3.1 3.1 7-7 1.4 1.4-8.4 8.4z" />
  </svg>
);

const SettingsPage = () => {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    zipCode: user?.zipCode || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [systemStatus, setSystemStatus] = useState('ONLINE');

  // Migrate status polling to profile
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data } = await api.get('/system/status');
        setSystemStatus(data.status || 'ONLINE');
      } catch { /* fail silently */ }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await api.put('/user/profile', formData);
      useAuthStore.setState({ user: { ...user, ...response.data } });
      setSaveMessage('Profile saved successfully.');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      setSaveMessage('Error saving profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto" ref={() => document.title = 'Profile & Settings | Redwood Crest Bank'}>
       <div className="mb-10">
          <h1 className="text-3xl font-light text-brand-text mb-2">Profile & settings</h1>
          <p className="text-sm text-gray-500">Manage your personal information and account preferences.</p>
       </div>

       {/* PREMIUM PROFILE HEADER */}
       <div className="bg-white border border-gray-200 md:rounded-lg shadow-sm p-8 mb-8 flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
             <div className="w-32 h-32 rounded-full bg-brand-blue flex items-center justify-center text-white text-4xl font-light shadow-inner">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
             </div>
             {/* Instagram Blue Tick overlay on avatar for mobile, or beside name for desktop */}
             <div className="absolute bottom-1 right-1 md:hidden">
                <VerifiedBadge />
             </div>
          </div>

          <div className="flex-1 text-center md:text-left">
             <div className="flex flex-col md:flex-row items-center gap-2 mb-2">
                <h2 className="text-2xl font-semibold text-brand-text">{user?.firstName} {user?.lastName}</h2>
                <div className="hidden md:block">
                   <VerifiedBadge />
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider ml-1">
                   Verified Account
                </span>
             </div>
             <p className="text-gray-500 mb-6">{user?.email}</p>

             {/* Migrated System Status */}
             <div className="flex items-center justify-center md:justify-start gap-4 py-3 px-4 bg-gray-50 rounded-lg inline-flex border border-gray-100">
                <div className="flex items-center gap-2">
                   <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                     systemStatus === 'ONLINE' ? 'bg-green-500' :
                     systemStatus === 'BUSY' ? 'bg-yellow-500' : 'bg-red-500'
                   }`} />
                   <span className={`text-xs font-bold uppercase tracking-wide ${
                     systemStatus === 'ONLINE' ? 'text-green-600' :
                     systemStatus === 'BUSY' ? 'text-yellow-600' : 'text-red-600'
                   }`}>
                     System: {systemStatus === 'ONLINE' ? 'All systems operational' :
                           systemStatus === 'BUSY' ? 'Elevated load' : 'Maintenance'}
                   </span>
                </div>
                <div className="h-4 w-px bg-gray-200 mx-2 hidden sm:block"></div>
                <div className="text-[10px] text-gray-400 font-medium uppercase tracking-widest hidden sm:block">
                   Technical Placement Area
                </div>
             </div>
          </div>
       </div>

       <div className="bg-white border border-gray-200 md:rounded-lg shadow-sm overflow-hidden mb-6">
         <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
           <h2 className="text-lg font-semibold text-brand-text">Personal Details</h2>
         </div>
         <form onSubmit={handleSave} className="p-6 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
               <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full border-gray-300 rounded focus:border-brand-blue focus:ring-brand-blue shadow-sm" />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Social Security Number</label>
               <p className="text-sm pt-2 text-gray-500 font-medium">***-**-{user?.ssnLast4 || '****'} (Masked)</p>
             </div>
             <div className="md:col-span-2">
               <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
               <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full border-gray-300 rounded focus:border-brand-blue focus:ring-brand-blue shadow-sm" />
               <p className="text-xs text-gray-400 mt-2">Required for home equity and loan applications.</p>
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
               <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full border-gray-300 rounded focus:border-brand-blue focus:ring-brand-blue shadow-sm" />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">State / Zip</label>
               <div className="flex gap-2">
                 <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-1/3 border-gray-300 rounded focus:border-brand-blue focus:ring-brand-blue uppercase shadow-sm" maxLength="2" placeholder="CA" />
                 <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} className="w-2/3 border-gray-300 rounded focus:border-brand-blue focus:ring-brand-blue shadow-sm" placeholder="94105" />
               </div>
             </div>
           </div>

           <div className="pt-4 flex items-center justify-end space-x-4 border-t border-gray-100 mt-6">
             {saveMessage && <span className="text-sm font-medium text-green-600">{saveMessage}</span>}
             <button type="submit" disabled={isSaving} className="mt-4 bg-brand-blue hover:bg-blue-800 text-white font-medium py-2.5 px-6 rounded transition-colors flex items-center space-x-2 disabled:opacity-50">
                <Save size={18} />
                <span>Save Changes</span>
             </button>
           </div>
         </form>
       </div>
    </div>
  );
};
export default SettingsPage;
