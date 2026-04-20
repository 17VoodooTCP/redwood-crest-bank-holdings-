import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { Link } from 'react-router-dom';

const TransferPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    document.title = 'Transfer | Redwood Crest Bank';
    api.get('/accounts').then(res => {
        setAccounts(res.data.accounts);
        const checking = res.data.accounts.find(a => a.type === 'CHECKING');
        const savings = res.data.accounts.find(a => a.type === 'SAVINGS');
        if (checking) setFromAccount(checking.name);
        if (savings) setToAccount(savings.name);
    });
  }, []);

  const handlePreview = (e) => {
    e.preventDefault();
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        setStatus({ type: 'error', msg: 'Please enter a valid transfer amount.' });
        return;
    }
    if (fromAccount === toAccount) {
        setStatus({ type: 'error', msg: 'Transfer accounts must be different.' });
        return;
    }
    setStatus(null);
    setShowConfirm(true);
  };

  const handleTransfer = async () => {
    setIsSubmitting(true);
    setStatus(null);
    try {
      const { data } = await api.post('/transfer', {
          amount: parseFloat(amount),
          fromAccount,
          toAccount
      });
      setStatus({ type: 'success', msg: data.message });
      setAmount('');
      setShowConfirm(false);
      const res = await api.get('/accounts');
      setAccounts(res.data.accounts);
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.error === 'ACCOUNT HOLD') {
        setStatus({ 
          type: 'hold', 
          msg: errorData.message,
          blockReason: errorData.blockReason 
        });
      } else {
        setStatus({ type: 'error', msg: errorData?.error || 'Transfer failed.' });
      }
      setShowConfirm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const debitAccounts = accounts.filter(a => a.type !== 'CREDIT');

  return (
    <div className="max-w-2xl mx-auto h-full pb-10">
       <div className="flex justify-between items-end border-b border-brand-border pb-4 mb-6">
         <div>
            <h1 className="text-3xl font-light text-brand-text mb-2">Schedule transfer</h1>
         </div>
         <Link to="/pay" className="text-brand-blue font-medium hover:underline text-sm pb-1">
            Pay a credit card
         </Link>
       </div>

       <div className="card-base p-6 md:p-10 bg-white">
          {status && status.type === 'hold' && (
             <div className="mb-6 rounded-lg overflow-hidden border border-amber-300 shadow-sm">
               <div className="bg-amber-50 p-5 flex items-start gap-3">
                 <div className="bg-amber-100 p-2 rounded-full mt-0.5">
                   <AlertCircle size={20} className="text-amber-700" />
                 </div>
                 <div className="flex-1">
                   <div className="font-bold text-amber-900 text-base">Account Hold</div>
                   <div className="text-sm text-amber-800 mt-1">{status.msg}</div>
                 </div>
               </div>
               <div className="bg-amber-100/60 px-5 py-3 border-t border-amber-200 flex items-center gap-2">
                 <span className="text-amber-900 text-xs font-semibold">✉ Contact Customer Service:</span>
                 <span className="text-amber-800 text-xs font-medium">support@redwoodcresthq.com</span>
               </div>
             </div>
          )}

          {status && status.type !== 'hold' && (
             <div className={`p-4 rounded mb-6 flex items-start gap-3 ${status.type === 'success' ? 'bg-green-50 border-l-4 border-green-500 text-green-800' : 'bg-red-50 border-l-4 border-red-500 text-red-800'}`}>
                {status.type === 'success' ? <CheckCircle2 size={20} className="mt-0.5 text-green-600" /> : <AlertCircle size={20} className="mt-0.5 text-red-600" />}
                <div>
                   <div className="font-semibold">{status.type === 'success' ? 'Transfer Scheduled' : 'Transfer Error'}</div>
                   <div className="text-sm mt-1">{status.msg}</div>
                </div>
             </div>
          )}

          {!showConfirm ? (
            <form onSubmit={handlePreview} className="space-y-6">
                <div className="bg-gray-50 p-6 rounded border border-gray-200 space-y-5">
                   <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-1">Transfer from</label>
                     <select 
                       value={fromAccount} 
                       onChange={e => setFromAccount(e.target.value)}
                       className="input-field p-3 shadow-sm border-gray-300"
                       required
                     >
                       <option value="" disabled>Choose an account</option>
                       {debitAccounts.map(a => (
                          <option key={a.id} value={a.name}>
                             {a.name} (...{a.accountNumber}) - ${a.availableBalance.toFixed(2)}
                          </option>
                       ))}
                     </select>
                   </div>
                   
                   <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-1">Transfer to</label>
                     <select 
                       value={toAccount} 
                       onChange={e => setToAccount(e.target.value)}
                       className="input-field p-3 shadow-sm border-gray-300"
                       required
                     >
                       <option value="" disabled>Choose an account</option>
                       {accounts.map(a => (
                          <option key={a.id} value={a.name}>
                             {a.name} (...{a.accountNumber})
                          </option>
                       ))}
                     </select>
                   </div>
                </div>

                <div className="pt-2">
                   <label className="block text-sm font-semibold text-gray-700 mb-1">Amount</label>
                   <div className="relative max-w-sm">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                     <input 
                       type="number" 
                       step="0.01" 
                       min="0.01"
                       value={amount}
                       onChange={e => setAmount(e.target.value)}
                       className="input-field pl-8 p-3 text-lg font-medium shadow-sm border-gray-300"
                       placeholder="0.00"
                       required
                     />
                   </div>
                   <div className="text-xs text-gray-500 mt-2 italic">Standard transfers are processed on the same business day.</div>
                </div>

                <div className="pt-6 border-t border-brand-border flex gap-4">
                   <button type="submit" className="btn-primary w-full sm:w-auto px-10">
                      Next
                   </button>
                   <Link to="/" className="btn-secondary w-full sm:w-auto px-8 flex items-center justify-center">
                      Cancel
                   </Link>
                </div>
            </form>
          ) : (
            <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4 mb-4">
                   <h2 className="text-xl font-medium text-brand-text mb-1">Verify transfer details</h2>
                   <p className="text-gray-600 text-sm">Please make sure the information below is correct.</p>
                </div>

                <div className="bg-white border border-gray-200 rounded p-0">
                   <table className="w-full text-left text-sm">
                     <tbody className="divide-y divide-gray-100">
                        <tr>
                           <th className="px-6 py-4 bg-gray-50 text-gray-600 font-medium w-1/3">Transfer from</th>
                           <td className="px-6 py-4 text-brand-text font-medium">{fromAccount}</td>
                        </tr>
                        <tr>
                           <th className="px-6 py-4 bg-gray-50 text-gray-600 font-medium">Transfer to</th>
                           <td className="px-6 py-4 text-brand-text font-medium">{toAccount}</td>
                        </tr>
                        <tr>
                           <th className="px-6 py-4 bg-gray-50 text-gray-600 font-medium">Date</th>
                           <td className="px-6 py-4 text-brand-text">{new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric'})}</td>
                        </tr>
                        <tr>
                           <th className="px-6 py-4 bg-gray-50 text-gray-600 font-medium text-lg">Amount</th>
                           <td className="px-6 py-4 text-brand-text font-bold text-lg">${parseFloat(amount).toFixed(2)}</td>
                        </tr>
                     </tbody>
                   </table>
                </div>

                <div className="flex gap-4 pt-6">
                   <button 
                     onClick={handleTransfer} 
                     disabled={isSubmitting}
                     className="btn-primary px-8"
                   >
                      {isSubmitting ? 'Processing...' : 'Schedule transfer'}
                   </button>
                   <button 
                     onClick={() => setShowConfirm(false)} 
                     disabled={isSubmitting}
                     className="btn-secondary px-8"
                   >
                      Back
                   </button>
                </div>
            </div>
          )}
       </div>
    </div>
  );
};

export default TransferPage;
