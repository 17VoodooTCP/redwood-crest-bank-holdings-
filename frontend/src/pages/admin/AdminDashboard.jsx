import { useState, useEffect } from 'react';
import { ShieldAlert, Activity, ServerCrash, CheckCircle, LogOut, MessageCircle } from 'lucide-react';
import api from '../../services/api';
import AdminOmnibox from './AdminOmnibox';
import AdminCreate from './AdminCreate';
import AdminAccounts from './AdminAccounts';
import AdminSecurity from './AdminSecurity';
import AdminHistory from './AdminHistory';
import AdminLiveChat from './AdminLiveChat';

const AdminDashboard = () => {
  // ── Admin Auth State ──
  const [adminAuth, setAdminAuth] = useState(false);
  const [adminChecking, setAdminChecking] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('omnibox');
  const [users, setUsers] = useState([]);
  const [logins, setLogins] = useState([]);
  const [systemStatus, setSystemStatus] = useState('ONLINE');
  const [loading, setLoading] = useState(true);

  // ── Admin Session Management ──
  useEffect(() => {
    verifyAdminSession();
  }, []);

  const verifyAdminSession = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setAdminChecking(false);
      return;
    }
    try {
      await api.get('/admin/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdminAuth(true);
    } catch {
      localStorage.removeItem('adminToken');
    }
    setAdminChecking(false);
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await api.post('/admin/login', { email: loginEmail, password: loginPassword });
      localStorage.setItem('adminToken', res.data.token);
      setAdminAuth(true);
    } catch (err) {
      setLoginError(err.response?.data?.error || 'Authentication failed.');
    }
    setLoginLoading(false);
  };

  const handleAdminSignOut = () => {
    localStorage.removeItem('adminToken');
    setAdminAuth(false);
    setLoginEmail('');
    setLoginPassword('');
  };

  // ── Data Fetching ──
  useEffect(() => {
    if (adminAuth) fetchData();
  }, [adminAuth]);

  useEffect(() => {
    if (adminAuth && (activeTab === 'accounts' || activeTab === 'create')) {
      fetchData();
    }
  }, [activeTab, adminAuth]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const uRes = await api.get('/admin/users');
      setUsers(uRes.data.users || []);
    } catch (err) {
      console.error('[ADMIN FETCH USERS ERROR]', err);
    }
    try {
      const logRes = await api.get('/admin/security/logins');
      setLogins(logRes.data.logins || []);
    } catch (err) {
      console.error('[ADMIN FETCH LOGINS ERROR]', err);
    }
    try {
      const sysRes = await api.get('/system/status');
      setSystemStatus(sysRes.data.status || 'ONLINE');
    } catch (err) {
      console.error('[ADMIN FETCH STATUS ERROR]', err);
    }
    setLoading(false);
  };

  const handleSystemStatusChange = async (status) => {
    try {
      await api.post('/system/status', { status });
      setSystemStatus(status);
      alert(`System status updated to ${status}`);
    } catch {
      alert('Failed to update system status.');
    }
  };

  // ── Admin Login Screen ──
  if (adminChecking) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500 font-medium">Verifying session...</div>
      </div>
    );
  }

  if (!adminAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A1E3F] via-[#0f2b5c] to-[#061326] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4" style={{ height: '56px', width: '280px', overflow: 'hidden', margin: '0 auto 16px' }}>
              <img src="/logo.png" alt="Redwood Crest" style={{ height: '210px', width: 'auto', margin: '-77px 0', maxWidth: 'none', filter: 'invert(1) grayscale(1) brightness(2)', mixBlendMode: 'screen' }} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Admin Console</h1>
            <p className="text-gray-400 text-sm mt-1">Redwood Crest — Superuser Access</p>
          </div>

          <form onSubmit={handleAdminLogin} className="bg-white rounded-2xl shadow-2xl p-8 space-y-5">
            {loginError && (
              <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200 flex items-center gap-2">
                <ShieldAlert size={16} />
                {loginError}
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="admin@redwoodcresthq.com" required className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A1E3F] focus:border-transparent transition" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••" required className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A1E3F] focus:border-transparent transition" />
            </div>
            <button type="submit" disabled={loginLoading} className="w-full bg-[#0A1E3F] hover:bg-[#06132A] text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50">
              {loginLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-xs mt-6">Protected system. Unauthorized access is prohibited.</p>
        </div>
      </div>
    );
  }

  // ── Authenticated Admin View ──
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in pb-24">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4 border-gray-200">
        <div className="flex items-center gap-4">
          <div style={{ height: '40px', width: '220px', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" alt="Redwood Crest" style={{ height: '160px', width: 'auto', margin: '-60px 0', maxWidth: 'none', objectFit: 'contain' }} />
          </div>
          <div className="h-8 w-px bg-gray-300"></div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-brand-text">Admin Console</h1>
            <p className="text-gray-500 text-xs">Superuser access confirmed. Proceed with caution.</p>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex rounded-md shadow-sm">
            <button onClick={() => handleSystemStatusChange('ONLINE')} className={`px-4 py-2 text-xs font-semibold rounded-l-md border ${systemStatus === 'ONLINE' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
              <CheckCircle size={14} className="inline mr-1" /> ONLINE
            </button>
            <button onClick={() => handleSystemStatusChange('BUSY')} className={`px-4 py-2 text-xs font-semibold border-t border-b border-l-0 ${systemStatus === 'BUSY' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
              <Activity size={14} className="inline mr-1" /> BUSY
            </button>
            <button onClick={() => handleSystemStatusChange('MAINTENANCE')} className={`px-4 py-2 text-xs font-semibold rounded-r-md border ${systemStatus === 'MAINTENANCE' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
              <ServerCrash size={14} className="inline mr-1" /> MAINTENANCE
            </button>
          </div>
          <button onClick={handleAdminSignOut} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg max-w-2xl text-sm font-medium">
        {['omnibox', 'create', 'accounts', 'security', 'history', 'live chat'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2.5 px-4 rounded-md capitalize transition-colors ${activeTab === tab ? 'bg-white text-brand-blue shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}>
            {tab === 'live chat' && <MessageCircle size={14} className="inline mr-1" />}
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div className="text-center text-gray-500 py-12">Loading system telemetry...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
          {activeTab === 'omnibox' && <AdminOmnibox onDataChange={fetchData} />}
          {activeTab === 'create' && <AdminCreate users={users} onDataChange={fetchData} />}
          {activeTab === 'accounts' && <AdminAccounts users={users} onDataChange={fetchData} />}
          {activeTab === 'security' && <AdminSecurity logins={logins} />}
          {activeTab === 'history' && <AdminHistory users={users} />}
          {activeTab === 'live chat' && <AdminLiveChat />}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
