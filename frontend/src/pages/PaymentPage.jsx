import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { SUPPORT_EMAIL } from '../config/support';

const PaymentPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [creditAccount, setCreditAccount] = useState('');
  const [fromAccount, setFromAccount] = useState('');
  const [amountType, setAmountType] = useState('MINIMUM');
  const [customAmount, setCustomAmount] = useState('');
  
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    document.title = 'Pay Credit Card | Redwood Crest Bank';
    api.get('/accounts').then(res => {
        setAccounts(res.data.accounts);
        const credit = res.data.accounts.find(a => a.type === 'CREDIT');
        const checking = res.data.accounts.find(a => a.type === 'CHECKING');
        if (credit) setCreditAccount(credit.name);
        if (checking) setFromAccount(checking.name);
    });
  }, []);

  const selectedCreditAcc = accounts.find(a => a.name === creditAccount);
  const debitAccounts = accounts.filter(a => a.type !== 'CREDIT');

  const getCalculatedAmount = () => {
      if (!selectedCreditAcc) return 0;
      switch (amountType) {
          case 'MINIMUM': return selectedCreditAcc.minimumPayment || 0;
          case 'STATEMENT': return selectedCreditAcc.statementBalance || 0;
          case 'CURRENT': return Math.abs(selectedCreditAcc.balance);
          case 'CUSTOM': return parseFloat(customAmount) || 0;
          default: return 0;
      }
  };

  const handlePreview = (e) => {
    e.preventDefault();
    const amount = getCalculatedAmount();
    
    if (amount <= 0) {
        setStatus({ type: 'error', msg: 'Please enter a valid payment amount.' });
        return;
    }
    setStatus(null);
    setShowConfirm(true);
  };

  const handlePayment = async () => {
    setIsSubmitting(true);
    setStatus(null);
    try {
      const payloadAmount = amountType === 'CUSTOM' ? parseFloat(customAmount) : amountType;
      
      const { data } = await api.post('/pay', {
          amount: payloadAmount,
          creditAccount,
          fromAccount
      });
      
      setStatus({ type: 'success', msg: data.message });
      setShowConfirm(false);
      setCustomAmount('');
      
      const res = await api.get('/accounts');
      setAccounts(res.data.accounts);
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.error === 'ACCOUNT HOLD') {
        setStatus({ type: 'hold', msg: errorData.message, blockReason: errorData.blockReason });
      } else {
        setStatus({ type: 'error', msg: errorData?.error || 'Payment failed.' });
      }
      setShowConfirm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-full pb-10">
       <div className="flex justify-between items-end border-b border-brand-border pb-4 mb-6">
         <div>
            <h1 className="text-3xl font-light text-brand-text mb-2">Pay credit card</h1>
         </div>
         <Link to="/transfer" className="text-brand-blue font-medium hover:underline text-sm pb-1">
            Schedule a transfer 
         </Link>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="col-span-2 card-base p-6 md:p-8 bg-white">
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
                    <span className="text-amber-900 text-xs font-semibold">✉ Contact Customer Support:</span>
                    <a href={`mailto:${SUPPORT_EMAIL}`} className="text-amber-800 text-xs font-medium underline hover:text-amber-950">{SUPPORT_EMAIL}</a>
                  </div>
                </div>
             )}

             {status && status.type !== 'hold' && (
                <div className={`p-4 rounded mb-6 flex items-start gap-3 ${status.type === 'success' ? 'bg-green-50 border-l-4 border-green-500 text-green-800' : 'bg-red-50 border-l-4 border-red-500 text-red-800'}`}>
                   {status.type === 'success' ? <CheckCircle2 size={20} className="mt-0.5 text-green-600" /> : <AlertCircle size={20} className="mt-0.5 text-red-600" />}
                   <div>
                      <div className="font-semibold">{status.type === 'success' ? 'Payment Scheduled' : 'Payment Error'}</div>
                      <div className="text-sm mt-1">{status.msg}</div>
                   </div>
                </div>
             )}

             {!showConfirm ? (
               <form onSubmit={handlePreview} className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded border border-gray-200">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Pay to</label>
                        <select 
                          value={creditAccount} 
                          onChange={e => setCreditAccount(e.target.value)}
                          className="input-field p-3 bg-white"
                          required
                        >
                          {accounts.filter(a => a.type === 'CREDIT').map(a => (
                            <option key={a.id} value={a.name}>{a.name} (...{a.accountNumber})</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Pay from</label>
                        <select 
                          value={fromAccount} 
                          onChange={e => setFromAccount(e.target.value)}
                          className="input-field p-3 bg-white"
                          required
                        >
                          {debitAccounts.map(a => (
                            <option key={a.id} value={a.name}>{a.name} (...{a.accountNumber}) - ${a.availableBalance.toFixed(2)}</option>
                          ))}
                        </select>
                      </div>
                   </div>

                   <div className="pt-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Amount to pay</label>
                      <div className="space-y-3">
                         <label className={`flex items-center p-4 border rounded cursor-pointer transition-colors ${amountType === 'MINIMUM' ? 'border-brand-blue bg-blue-50/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                            <input type="radio" checked={amountType === 'MINIMUM'} onChange={() => setAmountType('MINIMUM')} className="w-4 h-4 text-brand-blue" />
                            <div className="ml-3 flex-1 flex justify-between">
                               <span className="text-gray-700 font-medium">Minimum payment due</span>
                               <span className="font-semibold">${(selectedCreditAcc?.minimumPayment || 0).toFixed(2)}</span>
                            </div>
                         </label>

                         <label className={`flex items-center p-4 border rounded cursor-pointer transition-colors ${amountType === 'STATEMENT' ? 'border-brand-blue bg-blue-50/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                            <input type="radio" checked={amountType === 'STATEMENT'} onChange={() => setAmountType('STATEMENT')} className="w-4 h-4 text-brand-blue" />
                            <div className="ml-3 flex-1 flex justify-between">
                               <span className="text-gray-700 font-medium">Statement balance</span>
                               <span className="font-semibold">${(selectedCreditAcc?.statementBalance || 0).toFixed(2)}</span>
                            </div>
                         </label>

                         <label className={`flex items-center p-4 border rounded cursor-pointer transition-colors ${amountType === 'CURRENT' ? 'border-brand-blue bg-blue-50/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                            <input type="radio" checked={amountType === 'CURRENT'} onChange={() => setAmountType('CURRENT')} className="w-4 h-4 text-brand-blue" />
                            <div className="ml-3 flex-1 flex justify-between">
                               <span className="text-gray-700 font-medium">Current balance</span>
                               <span className="font-semibold">${Math.abs(selectedCreditAcc?.balance || 0).toFixed(2)}</span>
                            </div>
                         </label>

                         <label className={`flex items-center p-4 border rounded cursor-pointer transition-colors ${amountType === 'CUSTOM' ? 'border-brand-blue bg-blue-50/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                            <input type="radio" checked={amountType === 'CUSTOM'} onChange={() => setAmountType('CUSTOM')} className="w-4 h-4 text-brand-blue" />
                            <div className="ml-3">
                               <span className="text-gray-700 font-medium">Other amount</span>
                            </div>
                         </label>
                      </div>

                      {amountType === 'CUSTOM' && (
                         <div className="mt-4 relative max-w-xs ml-8">
                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                           <input 
                             type="number" 
                             step="0.01"
                             min="0.01"
                             value={customAmount}
                             onChange={e => setCustomAmount(e.target.value)}
                             className="input-field pl-8 focus:border-brand-blue"
                             placeholder="0.00"
                             autoFocus
                           />
                         </div>
                      )}
                   </div>

                   <div className="pt-6 border-t border-brand-border">
                      <button type="submit" className="btn-primary px-10">
                         Next
                      </button>
                   </div>
               </form>
             ) : (
               <div className="space-y-6">
                   <div className="border-b border-gray-200 pb-4 mb-4">
                      <h2 className="text-xl font-medium text-brand-text mb-1">Verify payment details</h2>
                   </div>

                   <table className="w-full text-left text-sm border border-gray-200 rounded overflow-hidden shadow-sm">
                     <tbody className="divide-y divide-gray-100">
                        <tr>
                           <th className="px-6 py-4 bg-gray-50 text-gray-600 font-medium w-1/3">Pay from</th>
                           <td className="px-6 py-4 text-brand-text font-medium">{fromAccount}</td>
                        </tr>
                        <tr>
                           <th className="px-6 py-4 bg-gray-50 text-gray-600 font-medium w-1/3">Pay to</th>
                           <td className="px-6 py-4 text-brand-text font-medium">{creditAccount}</td>
                        </tr>
                        <tr>
                           <th className="px-6 py-4 bg-gray-50 text-gray-600 font-medium">Date</th>
                           <td className="px-6 py-4 text-brand-text">{new Date().toLocaleDateString('en-US')}</td>
                        </tr>
                        <tr>
                           <th className="px-6 py-4 bg-gray-50 text-gray-600 font-medium text-lg">Amount</th>
                           <td className="px-6 py-4 text-brand-text font-bold text-lg">${getCalculatedAmount().toFixed(2)}</td>
                        </tr>
                     </tbody>
                   </table>

                   <div className="flex gap-4 pt-6">
                      <button 
                        onClick={handlePayment} 
                        disabled={isSubmitting}
                        className="btn-primary px-8"
                      >
                         {isSubmitting ? 'Processing...' : 'Pay'}
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

          <div className="col-span-1">
             <div className="bg-gray-50 border border-gray-200 rounded p-6">
                <h3 className="text-brand-text font-semibold mb-4 pb-2 border-b border-gray-200">Account Summary</h3>
                
                {selectedCreditAcc ? (
                   <div className="space-y-4">
                      <div className="flex justify-between">
                         <span className="text-gray-600 text-sm">Statement balance</span>
                         <span className="font-medium text-brand-text">${(selectedCreditAcc?.statementBalance || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-gray-600 text-sm">Current balance</span>
                         <span className="font-medium text-brand-text">${Math.abs(selectedCreditAcc.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-gray-600 text-sm">Available credit</span>
                         <span className="font-medium text-green-600">${selectedCreditAcc.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="pt-4 mt-2 border-t border-gray-200">
                         <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-600 text-sm">Next payment due</span>
                            <span className="text-brand-text text-sm font-medium">{selectedCreditAcc.nextPaymentDue || 'N/A'}</span>
                         </div>
                         <div className="flex justify-between items-center bg-white p-2 border border-gray-200 rounded">
                            <span className="text-gray-700 font-medium text-sm">Minimum due</span>
                            <span className="text-brand-text font-bold text-sm">${(selectedCreditAcc.minimumPayment || 0).toFixed(2)}</span>
                         </div>
                      </div>
                   </div>
                ) : (
                   <div className="text-gray-500 text-sm">Select an account to view details.</div>
                )}
             </div>
          </div>
       </div>
    </div>
  );
};

export default PaymentPage;
