import React from 'react';
import { Shield, Smartphone, Key } from 'lucide-react';

const SecurityPage = () => {
  return (
    <div className="max-w-4xl mx-auto" ref={() => document.title = 'Security Center | Redwood Crest Bank'}>
       <h1 className="text-3xl font-light text-brand-text mb-8">Security Center</h1>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Password */}
         <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col justify-between">
           <div>
             <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
               <Key className="text-brand-blue" size={24} />
             </div>
             <h2 className="text-xl font-semibold text-brand-text mb-2">Password Manager</h2>
             <p className="text-gray-500 text-sm mb-6">Update your password regularly to keep your account secure. Your last password update was 45 days ago.</p>
           </div>
           <button className="w-full border border-brand-blue text-brand-blue hover:bg-blue-50 font-medium py-2 rounded transition-colors">
             Change Password
           </button>
         </div>

         {/* 2FA */}
         <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col justify-between">
           <div>
             <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-4">
               <Smartphone className="text-green-600" size={24} />
             </div>
             <h2 className="text-xl font-semibold text-brand-text mb-2">Two-Factor Authentication</h2>
             <p className="text-gray-500 text-sm mb-6">Add an extra layer of security to your account using an authenticator app.</p>
           </div>
           <button className="w-full bg-brand-blue text-white hover:bg-blue-800 font-medium py-2 rounded transition-colors">
             Manage 2FA Settings
           </button>
         </div>
       </div>

       {/* Security Activity */}
       <div className="bg-white border border-gray-200 md:rounded-lg shadow-sm overflow-hidden mt-8">
         <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
           <Shield className="text-brand-blue" size={20} />
           <h2 className="text-lg font-semibold text-brand-text">Recent Security Activity</h2>
         </div>
         <div className="divide-y divide-gray-100">
            <div className="px-6 py-4">
              <p className="text-sm font-medium text-gray-800">Successful login from Windows NT (Chrome)</p>
              <p className="text-xs text-gray-500">Today at 10:42 AM • San Francisco, CA</p>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm font-medium text-gray-800">Password changed</p>
              <p className="text-xs text-gray-500">45 days ago • San Francisco, CA</p>
            </div>
         </div>
       </div>
    </div>
  );
};
export default SecurityPage;
