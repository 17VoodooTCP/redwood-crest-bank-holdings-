import { useState } from 'react';
import { Database, Lock, Unlock, Trash2 } from 'lucide-react';
import api from '../../services/api';

const AdminAccounts = ({ users, onDataChange }) => {
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [blockReason, setBlockReason] = useState('');
  const [decommissioningAccId, setDecommissioningAccId] = useState(null);

  const handleDecommission = async (accountId) => {
    try {
      await api.delete(`/admin/accounts/${accountId}`);
      alert('Account and all history permanently decommissioned.');
      setDecommissioningAccId(null);
      onDataChange?.();
    } catch (err) {
      alert(`Failure: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleToggleBlock = async (account) => {
    try {
      const action = account.isBlocked ? 'unblock' : 'block';
      await api.post('/admin/accounts/block', {
        accountId: account.id,
        action,
        reason: action === 'block' ? blockReason || 'Security Hold' : undefined
      });
      onDataChange?.();
      setSelectedAccount(null);
      setBlockReason('');
      alert(`Account ${action}ed successfully.`);
    } catch (err) {
      alert(`Error: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <div className="p-0">
      <div className="bg-gray-50 px-6 py-4 border-b">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Database className="text-brand-blue" size={20} /> Action Center
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3">User</th>
              <th className="px-6 py-3">Account Type</th>
              <th className="px-6 py-3">Number</th>
              <th className="px-6 py-3">Balance</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user =>
              user.accounts.map(acc => (
                <tr key={acc.id} className="border-b hover:bg-gray-50 group">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {user.firstName} {user.lastName}<br />
                    <span className="text-xs text-gray-500 font-normal">{user.email}</span>
                  </td>
                  <td className="px-6 py-4">{acc.name}</td>
                  <td className="px-6 py-4">...{acc.accountNumber}</td>
                  <td className="px-6 py-4">${acc.balance.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    {acc.isBlocked ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                        <Lock size={12} /> Blocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        <Unlock size={12} /> Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3 items-center">
                      {decommissioningAccId === acc.id ? (
                        <div className="flex items-center gap-2 bg-red-50 p-2 rounded border border-red-200 animate-pulse">
                          <span className="text-[10px] font-bold text-red-700 uppercase">Confirm Erase?</span>
                          <button onClick={() => handleDecommission(acc.id)} className="text-[10px] bg-red-600 text-white px-2 py-1 rounded font-bold uppercase">Destroy</button>
                          <button onClick={() => setDecommissioningAccId(null)} className="text-[10px] text-gray-500 hover:underline">Cancel</button>
                        </div>
                      ) : (
                        <>
                          {selectedAccount?.id === acc.id ? (
                            <div className="flex flex-col items-end gap-2 animate-fade-in">
                              <input type="text" placeholder="Reason for hold..." value={blockReason} onChange={e => setBlockReason(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs w-48" />
                              <div className="flex gap-2">
                                <button onClick={() => setSelectedAccount(null)} className="text-xs text-gray-500 hover:underline">Cancel</button>
                                <button onClick={() => handleToggleBlock(acc)} className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Confirm Block</button>
                              </div>
                            </div>
                          ) : acc.isBlocked ? (
                            <button onClick={() => handleToggleBlock(acc)} className="text-green-600 font-medium hover:underline text-xs">Lift Hold</button>
                          ) : (
                            <button onClick={() => setSelectedAccount(acc)} className="text-red-600 font-medium hover:underline text-xs">Place Hold</button>
                          )}
                          <button onClick={() => setDecommissioningAccId(acc.id)} className="text-gray-300 hover:text-red-600 transition-colors p-1" title="Decommission Account">
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAccounts;
