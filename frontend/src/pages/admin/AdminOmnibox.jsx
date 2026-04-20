import { useState } from 'react';
import { Search, RefreshCw, Send } from 'lucide-react';
import api from '../../services/api';

const AdminOmnibox = ({ onDataChange }) => {
  const [command, setCommand] = useState('');
  const [cmdResponse, setCmdResponse] = useState('');
  const [cmdLoading, setCmdLoading] = useState(false);

  const executeCommand = async (e) => {
    e.preventDefault();
    if (!command.trim()) return;
    setCmdLoading(true);
    try {
      const res = await api.post('/admin/command', { command });
      setCmdResponse(res.data.stringOut || JSON.stringify(res.data));
      if (res.data.intent && res.data.intent.startsWith('admin_')) {
        onDataChange?.();
      }
    } catch (err) {
      setCmdResponse(err.response?.data?.error || err.message);
    }
    setCmdLoading(false);
  };

  return (
    <div className="p-8">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Search className="text-brand-blue" /> Command Omnibox
      </h2>
      <form onSubmit={executeCommand} className="relative">
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="e.g. admin create checking account for demo@redwoodcresthq.com"
          className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg py-4 pl-6 pr-16 text-lg focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
        />
        <button
          type="submit"
          disabled={cmdLoading}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-brand-blue text-white rounded-md hover:bg-blue-800 disabled:opacity-50"
        >
          {cmdLoading ? <RefreshCw className="animate-spin" size={24} /> : <Send size={24} />}
        </button>
      </form>

      <div className="mt-8 bg-gray-900 rounded-lg p-6 font-mono text-sm shadow-inner min-h-[250px]">
        <div className="flex items-center justify-between text-gray-400 mb-4 border-b border-gray-800 pb-2">
          <span>Output Terminal</span>
          <span className="text-xs">cobcli engine v2.0</span>
        </div>
        <pre className="text-green-400 whitespace-pre-wrap break-words">{cmdResponse || 'Awaiting command input...'}</pre>
      </div>
    </div>
  );
};

export default AdminOmnibox;
