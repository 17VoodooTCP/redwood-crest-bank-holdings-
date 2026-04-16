import { Globe, ShieldAlert, RefreshCw, Clock } from 'lucide-react';

const AdminSecurity = ({ logins, onRefresh }) => {
  return (
    <div className="p-0">
      <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Globe className="text-brand-blue" size={20} /> Security & Geoblocking Map
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">Live Login Telemetry</span>
          {onRefresh && (
            <button onClick={onRefresh} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
              <RefreshCw size={12} /> Refresh
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
        <div className="lg:col-span-2 bg-gray-100 relative min-h-[400px] border-r">
          <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-cover bg-center"></div>
          {logins.length > 0 ? (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-green-600 font-bold tracking-widest uppercase opacity-30 text-3xl">
                {logins.length} Login{logins.length !== 1 ? 's' : ''} Tracked
              </span>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-brand-blue font-bold tracking-widest uppercase opacity-30 text-4xl">Awaiting Data...</span>
            </div>
          )}
        </div>
        <div className="h-[400px] overflow-y-auto">
          {logins.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 px-6">
              <Clock size={32} className="mb-3 opacity-40" />
              <p className="text-sm text-center">No login attempts recorded yet</p>
              <p className="text-xs text-center mt-1">Login data will appear here in real-time as users sign in</p>
            </div>
          ) : (
            logins.map((login, idx) => (
              <div key={login.id || idx} className={`p-4 border-b ${login.isSuspicious ? 'bg-red-50' : 'bg-white'}`}>
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-sm font-mono">{login.ipAddress}</span>
                  <span className="text-xs text-gray-500">{new Date(login.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-700 mb-1">{login.location || 'Unknown location'}</p>
                {login.isSuspicious && (
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs font-semibold text-red-600 flex items-center gap-1">
                      <ShieldAlert size={14} /> Risk Detected
                    </span>
                    <button className="text-[10px] uppercase font-bold bg-gray-800 text-white px-2 py-1 rounded">Restrict Region</button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSecurity;
