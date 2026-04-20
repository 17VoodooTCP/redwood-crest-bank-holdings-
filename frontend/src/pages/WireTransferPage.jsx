import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Globe, Building2, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { Link } from 'react-router-dom';

const WireTransferPage = () => {
  const [tab, setTab] = useState('domestic'); // 'domestic' | 'international'
  const [accounts, setAccounts] = useState([]);
  const [fromAccount, setFromAccount] = useState('');
  const [amount, setAmount] = useState('');
  
  // Domestic fields
  const [recipientName, setRecipientName] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [memo, setMemo] = useState('');
  
  // International fields
  const [swiftCode, setSwiftCode] = useState('');
  const [iban, setIban] = useState('');
  const [recipientCountry, setRecipientCountry] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [recipientBankAddress, setRecipientBankAddress] = useState('');
  const [currency, setCurrency] = useState('USD');
  
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    document.title = 'Wire Transfer | Redwood Crest Bank';
    api.get('/accounts').then(res => {
      const debitAccts = res.data.accounts.filter(a => a.type !== 'CREDIT');
      setAccounts(debitAccts);
      if (debitAccts.length > 0) setFromAccount(debitAccts[0].name);
    });
  }, []);

  const wireFee = tab === 'domestic' ? 25.00 : 45.00;

  const handlePreview = (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setStatus({ type: 'error', msg: 'Please enter a valid wire amount.' });
      return;
    }
    if (!recipientName.trim()) {
      setStatus({ type: 'error', msg: 'Recipient name is required.' });
      return;
    }
    if (tab === 'domestic') {
      if (!routingNumber.trim() || routingNumber.length !== 9) {
        setStatus({ type: 'error', msg: 'Please enter a valid 9-digit routing number.' });
        return;
      }
      if (!accountNumber.trim()) {
        setStatus({ type: 'error', msg: 'Recipient account number is required.' });
        return;
      }
    } else {
      if (!swiftCode.trim() || swiftCode.length < 8) {
        setStatus({ type: 'error', msg: 'Please enter a valid SWIFT/BIC code (8-11 characters).' });
        return;
      }
      if (!iban.trim()) {
        setStatus({ type: 'error', msg: 'IBAN is required for international transfers.' });
        return;
      }
      if (!recipientCountry.trim()) {
        setStatus({ type: 'error', msg: 'Recipient country is required.' });
        return;
      }
    }
    setStatus(null);
    setShowConfirm(true);
  };

  const handleWireTransfer = async () => {
    setIsSubmitting(true);
    setStatus(null);
    try {
      const payload = {
        type: tab,
        amount: parseFloat(amount),
        fromAccount,
        recipientName: recipientName.trim(),
        memo: memo.trim(),
        ...(tab === 'domestic' ? {
          routingNumber: routingNumber.trim(),
          accountNumber: accountNumber.trim(),
          bankName: bankName.trim(),
        } : {
          swiftCode: swiftCode.trim(),
          iban: iban.trim(),
          recipientCountry: recipientCountry.trim(),
          recipientAddress: recipientAddress.trim(),
          recipientBankAddress: recipientBankAddress.trim(),
          currency,
        })
      };

      const { data } = await api.post('/wire', payload);
      setStatus({ type: 'success', msg: data.message });
      setShowConfirm(false);
      // Reset form
      setAmount('');
      setRecipientName('');
      setRoutingNumber('');
      setAccountNumber('');
      setBankName('');
      setMemo('');
      setSwiftCode('');
      setIban('');
      setRecipientCountry('');
      setRecipientAddress('');
      setRecipientBankAddress('');
      // Refresh balances
      const res = await api.get('/accounts');
      const debitAccts = res.data.accounts.filter(a => a.type !== 'CREDIT');
      setAccounts(debitAccts);
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.error === 'ACCOUNT HOLD') {
        setStatus({ type: 'hold', msg: errorData.message, blockReason: errorData.blockReason });
      } else {
        setStatus({ type: 'error', msg: errorData?.error || 'Wire transfer failed.' });
      }
      setShowConfirm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedAcc = accounts.find(a => a.name === fromAccount);

  return (
    <div className="max-w-3xl mx-auto h-full pb-10">
       <div className="flex justify-between items-end border-b border-brand-border pb-4 mb-6">
         <div>
            <h1 className="text-3xl font-light text-brand-text mb-2">Wire transfer</h1>
         </div>
         <Link to="/transfer" className="text-brand-blue font-medium hover:underline text-sm pb-1">
            Internal transfers
         </Link>
       </div>

       {/* Tab Selection */}
       <div className="flex mb-6 bg-gray-100 rounded-lg p-1 max-w-sm">
         <button
           onClick={() => { setTab('domestic'); setShowConfirm(false); setStatus(null); }}
           className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
             tab === 'domestic' ? 'bg-white text-brand-blue shadow-sm' : 'text-gray-600 hover:text-brand-text'
           }`}
         >
           <Building2 size={16} />
           Domestic
         </button>
         <button
           onClick={() => { setTab('international'); setShowConfirm(false); setStatus(null); }}
           className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
             tab === 'international' ? 'bg-white text-brand-blue shadow-sm' : 'text-gray-600 hover:text-brand-text'
           }`}
         >
           <Globe size={16} />
           International
         </button>
       </div>

       {/* Wire fee notice */}
       <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6 text-sm text-blue-800 flex items-start gap-3">
         <AlertCircle size={18} className="mt-0.5 text-blue-500 flex-shrink-0" />
         <div>
           <strong>Wire transfer fee:</strong> A ${wireFee.toFixed(2)} fee applies to {tab === 'domestic' ? 'domestic' : 'international'} wire transfers. 
           {tab === 'international' && ' Additional intermediary bank fees may apply.'}
           <span className="block mt-1 text-xs text-blue-600">
             {tab === 'domestic' ? 'Domestic wires are typically processed within the same business day.' : 'International wires typically take 1-5 business days depending on destination.'}
           </span>
         </div>
       </div>

       <div className="card-base p-6 md:p-8 bg-white">
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
                   <div className="font-semibold">{status.type === 'success' ? 'Wire Transfer Submitted' : 'Wire Transfer Error'}</div>
                   <div className="text-sm mt-1">{status.msg}</div>
                </div>
             </div>
          )}

          {!showConfirm ? (
            <form onSubmit={handlePreview} className="space-y-6">
                {/* Source account */}
                <div className="bg-gray-50 p-6 rounded border border-gray-200">
                   <div>
                     <label className="block text-sm font-semibold text-gray-700 mb-1">Send from</label>
                     <select 
                       value={fromAccount} 
                       onChange={e => setFromAccount(e.target.value)}
                       className="input-field p-3 shadow-sm border-gray-300"
                       required
                     >
                       <option value="" disabled>Choose an account</option>
                       {accounts.map(a => (
                          <option key={a.id} value={a.name}>
                             {a.name} (...{a.accountNumber}) - ${a.availableBalance.toFixed(2)}
                          </option>
                       ))}
                     </select>
                   </div>
                </div>

                {/* Recipient info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide border-b border-gray-200 pb-2">Recipient Information</h3>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Recipient name</label>
                    <input 
                      type="text"
                      value={recipientName}
                      onChange={e => setRecipientName(e.target.value)}
                      className="input-field"
                      placeholder="Full legal name of the recipient"
                      required
                    />
                  </div>

                  {tab === 'domestic' ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Routing number</label>
                          <input 
                            type="text"
                            value={routingNumber}
                            onChange={e => setRoutingNumber(e.target.value.replace(/\D/g, '').slice(0, 9))}
                            className="input-field font-mono"
                            placeholder="9 digits"
                            maxLength={9}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Account number</label>
                          <input 
                            type="text"
                            value={accountNumber}
                            onChange={e => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                            className="input-field font-mono"
                            placeholder="Recipient's account number"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Recipient bank name <span className="text-gray-400 font-normal">(optional)</span></label>
                        <input 
                          type="text"
                          value={bankName}
                          onChange={e => setBankName(e.target.value)}
                          className="input-field"
                          placeholder="e.g. Bank of America"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">SWIFT/BIC code</label>
                          <input 
                            type="text"
                            value={swiftCode}
                            onChange={e => setSwiftCode(e.target.value.toUpperCase().slice(0, 11))}
                            className="input-field font-mono"
                            placeholder="e.g. BOFAUS3N"
                            maxLength={11}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">IBAN / Account number</label>
                          <input 
                            type="text"
                            value={iban}
                            onChange={e => setIban(e.target.value.toUpperCase())}
                            className="input-field font-mono"
                            placeholder="e.g. GB29NWBK60161331926819"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Recipient country</label>
                          <input 
                            type="text"
                            value={recipientCountry}
                            onChange={e => setRecipientCountry(e.target.value)}
                            className="input-field"
                            placeholder="e.g. United Kingdom"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Currency</label>
                          <select
                            value={currency}
                            onChange={e => setCurrency(e.target.value)}
                            className="input-field"
                          >
                            <option value="USD">USD — US Dollar</option>
                            <option value="EUR">EUR — Euro</option>
                            <option value="GBP">GBP — British Pound</option>
                            <option value="JPY">JPY — Japanese Yen</option>
                            <option value="CAD">CAD — Canadian Dollar</option>
                            <option value="AUD">AUD — Australian Dollar</option>
                            <option value="CHF">CHF — Swiss Franc</option>
                            <option value="CNY">CNY — Chinese Yuan</option>
                            <option value="INR">INR — Indian Rupee</option>
                            <option value="MXN">MXN — Mexican Peso</option>
                            <option value="NGN">NGN — Nigerian Naira</option>
                            <option value="BRL">BRL — Brazilian Real</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Recipient address <span className="text-gray-400 font-normal">(optional)</span></label>
                        <input 
                          type="text"
                          value={recipientAddress}
                          onChange={e => setRecipientAddress(e.target.value)}
                          className="input-field"
                          placeholder="Street address, city, postal code"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Recipient bank address <span className="text-gray-400 font-normal">(optional)</span></label>
                        <input 
                          type="text"
                          value={recipientBankAddress}
                          onChange={e => setRecipientBankAddress(e.target.value)}
                          className="input-field"
                          placeholder="Bank street address, city, country"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Amount */}
                <div className="pt-2">
                   <label className="block text-sm font-semibold text-gray-700 mb-1">Amount</label>
                   <div className="relative max-w-sm">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                     <input 
                       type="number" 
                       step="0.01" 
                       min="1.00"
                       value={amount}
                       onChange={e => setAmount(e.target.value)}
                       className="input-field pl-8 p-3 text-lg font-medium shadow-sm border-gray-300"
                       placeholder="0.00"
                       required
                     />
                   </div>
                   <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                     <span>Wire fee: <strong>${wireFee.toFixed(2)}</strong></span>
                     {amount && parseFloat(amount) > 0 && (
                       <span className="ml-2">• Total debit: <strong>${(parseFloat(amount) + wireFee).toFixed(2)}</strong></span>
                     )}
                   </div>
                </div>

                {/* Memo */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Memo / Reference <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input 
                    type="text"
                    value={memo}
                    onChange={e => setMemo(e.target.value)}
                    className="input-field"
                    placeholder="e.g. Invoice #12345"
                    maxLength={140}
                  />
                </div>

                <div className="pt-6 border-t border-brand-border flex gap-4">
                   <button type="submit" className="btn-primary px-10 flex items-center gap-2">
                      Review Wire <ArrowRight size={16} />
                   </button>
                   <Link to="/transfer" className="btn-secondary px-8 flex items-center justify-center">
                      Cancel
                   </Link>
                </div>
            </form>
          ) : (
            <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4 mb-4">
                   <h2 className="text-xl font-medium text-brand-text mb-1">Review wire transfer details</h2>
                   <p className="text-gray-600 text-sm">Please verify all details carefully. Wire transfers cannot be recalled once sent.</p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm text-amber-800 flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span>Wire transfers are final and cannot be reversed. Double-check the recipient details.</span>
                </div>

                <div className="bg-white border border-gray-200 rounded p-0 shadow-sm">
                   <table className="w-full text-left text-sm">
                     <tbody className="divide-y divide-gray-100">
                        <tr>
                           <th className="px-6 py-4 bg-gray-50 text-gray-600 font-medium w-1/3">Type</th>
                           <td className="px-6 py-4 text-brand-text font-medium capitalize">{tab} Wire</td>
                        </tr>
                        <tr>
                           <th className="px-6 py-4 bg-gray-50 text-gray-600 font-medium">Send from</th>
                           <td className="px-6 py-4 text-brand-text font-medium">{fromAccount}</td>
                        </tr>
                        <tr>
                           <th className="px-6 py-4 bg-gray-50 text-gray-600 font-medium">Recipient</th>
                           <td className="px-6 py-4 text-brand-text font-medium">{recipientName}</td>
                        </tr>
                        {tab === 'domestic' ? (
                          <>
                            <tr>
                               <th className="px-6 py-4 bg-gray-50 text-gray-600 font-medium">Routing number</th>
                               <td className="px-6 py-4 text-brand-text font-mono">{routingNumber}</td>
                            </tr>
                            <tr>
                               <th className="px-6 py-4 bg-gray-50 text-gray-600 font-medium">Account number</th>
                               <td className="px-6 py-4 text-brand-text font-mono">{'•'.repeat(Math.max(0, accountNumber.length - 4))}{accountNumber.slice(-4)}</td>
                            </tr>
                            {bankName && (
                              <tr>
                                 <th className="px-6 py-4 bg-gray-50 text-gray-600 font-medium">Bank name</th>
                                 <td className="px-6 py-4 text-brand-text">{bankName}</td>
                              </tr>
                            )}
                          </>
                        ) : (
                          <>
                            <tr>
                               <th className="px-6 py-4 bg-gray-50 text-gray-600 font-medium">SWIFT/BIC</th>
                               <td className="px-6 py-4 text-brand-text font-mono">{swiftCode}</td>
                            </tr>
                            <tr>
                               <th className="px-6 py-4 bg-gray-50 text-gray-600 font-medium">IBAN / Account</th>
                               <td className="px-6 py-4 text-brand-text font-mono">{iban}</td>
                            </tr>
                            <tr>
                               <th className="px-6 py-4 bg-gray-50 text-gray-600 font-medium">Country</th>
                               <td className="px-6 py-4 text-brand-text">{recipientCountry}</td>
                            </tr>
                            <tr>
                               <th className="px-6 py-4 bg-gray-50 text-gray-600 font-medium">Currency</th>
                               <td className="px-6 py-4 text-brand-text">{currency}</td>
                            </tr>
                          </>
                        )}
                        <tr>
                           <th className="px-6 py-4 bg-gray-50 text-gray-600 font-medium">Date</th>
                           <td className="px-6 py-4 text-brand-text">{new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric'})}</td>
                        </tr>
                        {memo && (
                          <tr>
                             <th className="px-6 py-4 bg-gray-50 text-gray-600 font-medium">Memo</th>
                             <td className="px-6 py-4 text-brand-text">{memo}</td>
                          </tr>
                        )}
                        <tr>
                           <th className="px-6 py-4 bg-gray-50 text-gray-600 font-medium">Wire amount</th>
                           <td className="px-6 py-4 text-brand-text font-semibold text-lg">${parseFloat(amount).toFixed(2)}</td>
                        </tr>
                        <tr>
                           <th className="px-6 py-4 bg-gray-50 text-gray-600 font-medium">Wire fee</th>
                           <td className="px-6 py-4 text-brand-text">${wireFee.toFixed(2)}</td>
                        </tr>
                        <tr className="bg-blue-50/50">
                           <th className="px-6 py-4 text-brand-text font-bold text-lg">Total debit</th>
                           <td className="px-6 py-4 text-brand-text font-bold text-lg">${(parseFloat(amount) + wireFee).toFixed(2)}</td>
                        </tr>
                     </tbody>
                   </table>
                </div>

                <div className="flex gap-4 pt-6">
                   <button 
                     onClick={handleWireTransfer} 
                     disabled={isSubmitting}
                     className="btn-primary px-8"
                   >
                      {isSubmitting ? 'Sending wire...' : 'Send wire transfer'}
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

export default WireTransferPage;
