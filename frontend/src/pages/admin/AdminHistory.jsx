import { useState, useEffect } from 'react';
import { Activity, ShieldAlert, Edit3, Calendar, Plus, Minus } from 'lucide-react';
import api from '../../services/api';

const AdminHistory = ({ users }) => {
  const [txForm, setTxForm] = useState({ accountId: '', amount: '', description: '', merchant: '', direction: 'credit' });
  const [targetTransactions, setTargetTransactions] = useState([]);
  const [editingTxId, setEditingTxId] = useState(null);
  const [newTxDate, setNewTxDate] = useState('');
  const [txLoading, setTxLoading] = useState(false);
  const [txDateSaving, setTxDateSaving] = useState(false);

  useEffect(() => {
    if (txForm.accountId) {
      fetchAccountTransactions(txForm.accountId);
    }
  }, [txForm.accountId]);

  const fetchAccountTransactions = async (accountId) => {
    if (!accountId) return;
    setTxLoading(true);
    try {
      const res = await api.get(`/admin/accounts/${accountId}/transactions`);
      setTargetTransactions(res.data.transactions || []);
    } catch (err) {
      console.error('Failed to fetch tx history', err);
    } finally {
      setTxLoading(false);
    }
  };

  const handleInjectTx = async (e) => {
    e.preventDefault();
    try {
      const magnitude = Math.abs(parseFloat(txForm.amount));
      if (Number.isNaN(magnitude) || magnitude <= 0) {
        alert('Please enter a valid amount greater than 0.');
        return;
      }
      const signedAmount = txForm.direction === 'debit' ? -magnitude : magnitude;
      await api.post('/admin/transactions/modify', {
        accountId: txForm.accountId,
        amount: signedAmount,
        description: txForm.description,
        merchant: txForm.merchant,
      });
      alert('Transaction injected successfully!');
      const accountId = txForm.accountId;
      setTxForm({ accountId: '', amount: '', description: '', merchant: '', direction: 'credit' });
      fetchAccountTransactions(accountId);
    } catch (err) {
      alert(`Error: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleUpdateTxDate = async (txId) => {
    if (!newTxDate) {
      alert('Please select a date.');
      return;
    }
    setTxDateSaving(true);
    try {
      const isoDate = new Date(newTxDate + 'T12:00:00').toISOString();
      await api.patch(`/admin/transactions/${txId}`, { date: isoDate });
      alert('Transaction date updated successfully.');
      setEditingTxId(null);
      setNewTxDate('');
      fetchAccountTransactions(txForm.accountId);
    } catch (err) {
      console.error('[ADMIN TX DATE UPDATE ERROR]', err);
      alert(`Update failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setTxDateSaving(false);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
        <Activity className="text-brand-blue" /> History Manipulation
      </h2>
      <p className="text-sm text-gray-500 mb-8 max-w-2xl font-medium">System override for manual transaction injection. This tool will directly alter both the transaction history AND the real-time account balance. Use with caution for account adjustments, corrections, or manual credits.</p>

      <form onSubmit={handleInjectTx} className="max-w-xl bg-gray-50 p-6 rounded-lg border border-gray-200">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Account</label>
            <select required className="w-full border-gray-300 rounded-md shadow-sm focus:border-brand-blue focus:ring-brand-blue" value={txForm.accountId} onChange={e => setTxForm({...txForm, accountId: e.target.value})}>
              <option value="">Select an account...</option>
              {users.map(u => u.accounts.map(a => (
                <option key={a.id} value={a.id}>{u.firstName} {u.lastName} - {a.name} (...{a.accountNumber})</option>
              )))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Direction</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTxForm({...txForm, direction: 'credit'})}
                className={`flex items-center justify-center gap-2 py-2 px-4 rounded-md border-2 font-semibold text-sm transition ${txForm.direction === 'credit' ? 'bg-green-50 border-green-600 text-green-700' : 'bg-white border-gray-300 text-gray-500 hover:border-gray-400'}`}
              >
                <Plus size={14} /> Credit (deposit)
              </button>
              <button
                type="button"
                onClick={() => setTxForm({...txForm, direction: 'debit'})}
                className={`flex items-center justify-center gap-2 py-2 px-4 rounded-md border-2 font-semibold text-sm transition ${txForm.direction === 'debit' ? 'bg-red-50 border-red-600 text-red-700' : 'bg-white border-gray-300 text-gray-500 hover:border-gray-400'}`}
              >
                <Minus size={14} /> Debit (withdraw)
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm ${txForm.direction === 'debit' ? 'text-red-600' : 'text-green-600'}`}>
                  {txForm.direction === 'debit' ? '-' : '+'}$
                </span>
                <input type="number" step="0.01" min="0" required value={txForm.amount} onChange={e => setTxForm({...txForm, amount: e.target.value})} placeholder="49.99" className="w-full pl-12 border-gray-300 rounded-md shadow-sm focus:border-brand-blue focus:ring-brand-blue" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Merchant (Optional)</label>
              <input type="text" value={txForm.merchant} onChange={e => setTxForm({...txForm, merchant: e.target.value})} placeholder="Netflix" className="w-full border-gray-300 rounded-md shadow-sm focus:border-brand-blue focus:ring-brand-blue" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input type="text" required value={txForm.description} onChange={e => setTxForm({...txForm, description: e.target.value})} placeholder="NETFLIX.COM" className="w-full border-gray-300 rounded-md shadow-sm focus:border-brand-blue focus:ring-brand-blue uppercase" />
          </div>
        </div>
        <button type="submit" className="mt-6 w-full bg-red-600 text-white font-semibold py-2 px-4 rounded hover:bg-red-700 transition flex items-center justify-center gap-2">
          <ShieldAlert size={16} /> Force Inject Transaction
        </button>
      </form>

      {/* Transaction Auditor Section */}
      {txForm.accountId && (
        <div className="mt-12 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
              <Edit3 size={16} className="text-brand-blue" /> Historical Data Auditor
            </h3>
            <span className="text-xs text-gray-500">{targetTransactions.length} records found</span>
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-3">Date Record</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {txLoading ? (
                  <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-400">Loading audit trail...</td></tr>
                ) : targetTransactions.length === 0 ? (
                  <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-400">No transaction data available for this account.</td></tr>
                ) : (
                  targetTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-mono">
                        {editingTxId === tx.id ? (
                          <input type="date" className="border border-brand-blue rounded px-2 py-1 text-[10px]" value={newTxDate} onChange={e => setNewTxDate(e.target.value)} />
                        ) : (
                          new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold">{tx.description}</div>
                        <div className="text-[10px] text-gray-400">{tx.category}</div>
                      </td>
                      <td className={`px-6 py-4 text-right font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {editingTxId === tx.id ? (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleUpdateTxDate(tx.id)} disabled={txDateSaving} className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-wait">
                              {txDateSaving ? 'Saving...' : 'Save'}
                            </button>
                            <button onClick={() => { setEditingTxId(null); setNewTxDate(''); }} disabled={txDateSaving} className="text-gray-500 hover:underline">Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => { setEditingTxId(tx.id); setNewTxDate(new Date(tx.date).toISOString().split('T')[0]); }} className="text-brand-blue hover:text-blue-800 flex items-center gap-1 justify-end w-full">
                            <Calendar size={12} /> Edit Date
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHistory;
