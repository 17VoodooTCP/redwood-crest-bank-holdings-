import React, { useEffect, useState } from 'react';
import { Mail, Search, MessageSquare } from 'lucide-react';
import api from '../services/api';

const MessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await api.get('/messages');
        if (response.data.length > 0) {
          setMessages(response.data);
        } else {
          setMessages([
            { id: 1, subject: 'Your new Home Equity Line is ready', body: 'Welcome to your new HELOC. You can now manage your credit line directly from your dashboard.', isRead: false, createdAt: new Date(Date.now() - 86400000).toISOString() },
            { id: 2, subject: 'Paperless statement available', body: 'Your latest statement is ready to view. Thank you for going paperless.', isRead: false, createdAt: new Date(Date.now() - 3*86400000).toISOString() },
            { id: 3, subject: 'Security alert: New sign-in recognized', body: 'We noticed a new sign in to your Redwood Crest Bank account.', isRead: true, createdAt: new Date(Date.now() - 5*86400000).toISOString() },
          ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  return (
    <div className="max-w-4xl mx-auto" ref={() => document.title = 'Secure Message Center | Redwood Crest Bank'}>
       <h1 className="text-3xl font-light text-brand-text mb-8">Secure Message Center</h1>

       <div className="bg-white border border-gray-200 md:rounded-lg shadow-sm overflow-hidden mb-6">
         <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
           <h2 className="text-lg font-semibold text-brand-text flex items-center gap-2">
             <Mail className="text-brand-blue" size={20} /> Inbox
           </h2>
           <div className="relative">
             <input type="text" placeholder="Search messages" className="pl-8 pr-4 py-1.5 text-sm border-gray-300 rounded focus:border-brand-blue focus:ring-brand-blue shadow-sm" />
             <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
           </div>
         </div>
         
         <div className="divide-y divide-gray-100">
           {loading ? (
             <div className="p-8 text-center text-gray-500">Loading messages...</div>
           ) : messages.length === 0 ? (
             <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                <MessageSquare size={48} className="text-gray-300 mb-4" />
                <p>You have no messages at this time.</p>
             </div>
           ) : (
             messages.map(msg => (
               <div key={msg.id} className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors flex gap-4 ${!msg.isRead ? 'bg-blue-50/30' : ''}`}>
                 <div className="mt-1 flex-shrink-0">
                   {!msg.isRead ? (
                     <div className="w-2.5 h-2.5 bg-brand-blue rounded-full shadow-sm"></div>
                   ) : (
                     <div className="w-2.5 h-2.5 bg-transparent rounded-full"></div>
                   )}
                 </div>
                 <div className="flex-1">
                   <div className="flex justify-between items-start mb-1">
                     <h3 className={`text-sm ${!msg.isRead ? 'font-bold text-brand-text' : 'font-medium text-gray-700'}`}>{msg.subject}</h3>
                     <span className="text-xs text-gray-500">{new Date(msg.createdAt).toLocaleDateString()}</span>
                   </div>
                   <p className="text-sm text-gray-500 line-clamp-1">{msg.body}</p>
                 </div>
               </div>
             ))
           )}
         </div>
       </div>
    </div>
  );
};
export default MessagesPage;
