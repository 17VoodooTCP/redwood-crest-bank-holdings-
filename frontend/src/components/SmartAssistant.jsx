import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User } from 'lucide-react';
import api from '../services/api';

const SmartAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi, I’m the Redwood Crest Bank Smart Assistant. You can use me to quickly transfer money, check balances, or search transactions. What can I help you with today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-assistant', handleOpen);
    return () => window.removeEventListener('open-assistant', handleOpen);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: cmd }]);
    setIsLoading(true);

    try {
      const response = await api.post('/command', { command: cmd });
      const apiResponse = response.data.stringOut || JSON.stringify(response.data.data, null, 2);
      
      setMessages(prev => [...prev, { role: 'assistant', content: apiResponse }]);
    } catch (error) {
      const errOut = error.response?.data?.stringOut || error.response?.data?.error || 'I encountered an error processing your request.';
      setMessages(prev => [...prev, { role: 'assistant', content: errOut }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40 transition-opacity" onClick={() => setIsOpen(false)}></div>
      <div className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-50 flex flex-col transform transition-transform border-l border-brand-border">
        {/* Header */}
        <div className="bg-brand-blue text-white p-4 flex justify-between items-center shadow-sm z-10">
           <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-full">
                 <Bot size={20} />
              </div>
              <span className="font-semibold text-lg">Smart Assistant</span>
           </div>
           <button onClick={() => setIsOpen(false)} className="hover:bg-black/10 p-2 rounded-full transition-colors">
              <X size={20} />
           </button>
        </div>

        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col space-y-4">
           {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                 <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                   
                   <div className="flex-shrink-0">
                     {msg.role === 'user' ? (
                       <div className="w-8 h-8 rounded-full bg-brand-light text-brand-blue flex items-center justify-center border border-brand-border">
                         <User size={14} />
                       </div>
                     ) : (
                       <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center shadow-sm">
                         <span className="font-bold text-xs">V</span>
                       </div>
                     )}
                   </div>

                   <div className={`p-3 rounded-2xl text-sm whitespace-pre-wrap word-break shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-brand-blue text-white rounded-br-none' 
                        : 'bg-white text-brand-text border border-brand-border rounded-bl-none'
                   }`}>
                      {msg.content}
                   </div>
                 </div>
              </div>
           ))}
           {isLoading && (
              <div className="flex justify-start">
                 <div className="flex items-end gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center">
                       <span className="font-bold text-xs">V</span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm border border-brand-border flex items-center space-x-1">
                       <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                       <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                       <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                 </div>
              </div>
           )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-brand-border">
           <form onSubmit={handleSend} className="relative flex items-center">
              <input
                 type="text"
                 value={input}
                 onChange={e => setInput(e.target.value)}
                 disabled={isLoading}
                 placeholder="Type a request (e.g., Transfer $50 to Checking)"
                 className="w-full bg-brand-light border border-brand-border rounded-full py-3 pl-4 pr-12 text-sm text-brand-text placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
              />
              <button 
                 type="submit" 
                 disabled={isLoading || !input.trim()}
                 className={`absolute right-2 p-2 rounded-full ${input.trim() ? 'bg-brand-blue text-white' : 'bg-transparent text-gray-400'}`}
              >
                 <Send size={16} className={input.trim() ? 'ml-0.5' : ''} />
              </button>
           </form>
           <div className="text-center mt-2 text-xs text-gray-400">
              Try: "accounts" or "transactions last week"
           </div>
        </div>
      </div>
    </>
  );
};

export default SmartAssistant;
