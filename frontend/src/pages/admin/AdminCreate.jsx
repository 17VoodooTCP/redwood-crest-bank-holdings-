import { useState } from 'react';
import { PlusCircle, RefreshCw, CheckCircle } from 'lucide-react';
import api from '../../services/api';

const AdminCreate = ({ users, onDataChange }) => {
  const [createMode, setCreateMode] = useState('new_customer');
  const [provisionForm, setProvisionForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
    phoneNumber: '', address: '', city: '', state: '', zipCode: '', ssnLast4: '',
    accountType: '', initialBalance: '', cardBrand: '', depositDate: '', expiryDate: ''
  });
  const [existingAccForm, setExistingAccForm] = useState({
    email: '', type: '', cardBrand: '', initialBalance: '', depositDate: '', expiryDate: ''
  });
  const [provisionSuccess, setProvisionSuccess] = useState(null);
  const [provisionLoading, setProvisionLoading] = useState(false);
  const [generatedAccNumber, setGeneratedAccNumber] = useState('');

  const generateAccountNumber = () => {
    const part1 = Math.floor(1000 + Math.random() * 9000);
    const part2 = Math.floor(1000 + Math.random() * 9000);
    const part3 = Math.floor(10 + Math.random() * 90);
    setGeneratedAccNumber(`${part1}${part2}${part3}`);
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (createMode === 'new_customer') {
      if (provisionForm.password !== provisionForm.confirmPassword) {
        return alert('Passwords do not match.');
      }
      setProvisionLoading(true);
      try {
        const { confirmPassword, ...payload } = provisionForm;
        if (generatedAccNumber) payload.accountNumber = generatedAccNumber;
        payload.initialBalance = parseFloat(provisionForm.initialBalance) || 0;
        payload.depositDate = provisionForm.depositDate;
        payload.expiryDate = provisionForm.expiryDate;

        const res = await api.post('/admin/customers/provision', payload);
        setProvisionSuccess(res.data);
        setProvisionForm({
          firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
          phoneNumber: '', address: '', city: '', state: '', zipCode: '', ssnLast4: '',
          accountType: '', initialBalance: '', cardBrand: '', depositDate: '', expiryDate: ''
        });
        setGeneratedAccNumber('');
        onDataChange?.();
      } catch (err) {
        alert(`Error: ${err.response?.data?.error || err.message}`);
      }
      setProvisionLoading(false);
    } else {
      try {
        const payload = {
          ...existingAccForm,
          initialBalance: parseFloat(existingAccForm.initialBalance) || 0,
          depositDate: existingAccForm.depositDate,
          expiryDate: existingAccForm.expiryDate
        };
        const res = await api.post('/admin/accounts/create', payload);
        setProvisionSuccess(res.data);
        setExistingAccForm({ email: '', type: '', cardBrand: '', initialBalance: '', depositDate: '', expiryDate: '' });
        onDataChange?.();
      } catch (err) {
        alert(`Error: ${err.response?.data?.error || err.message}`);
      }
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <PlusCircle className="text-brand-blue" /> Customer Onboarding
        </h2>
      </div>
      <p className="text-sm text-gray-500 mb-6 max-w-2xl">Create a complete customer profile or add a new account to an existing customer — without requiring them to register through the public interface.</p>

      {/* Mode toggle */}
      <div className="flex gap-0 mb-8 border border-gray-200 rounded-lg overflow-hidden w-fit">
        <button onClick={() => { setCreateMode('new_customer'); setProvisionSuccess(null); }} className={`px-5 py-2.5 text-sm font-semibold transition-colors ${createMode === 'new_customer' ? 'bg-brand-blue text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>New Customer</button>
        <button onClick={() => { setCreateMode('existing_user'); setProvisionSuccess(null); }} className={`px-5 py-2.5 text-sm font-semibold transition-colors border-l ${createMode === 'existing_user' ? 'bg-brand-blue text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>Add Account to Existing User</button>
      </div>

      {/* Success Banner */}
      {provisionSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="text-green-600 mt-0.5 shrink-0" size={18} />
          <div>
            <p className="font-semibold text-green-800">Success</p>
            <p className="text-sm text-green-700">{provisionSuccess.message}</p>
            {provisionSuccess.accountNumber && <p className="text-xs text-green-600 mt-1 font-mono">Account: {provisionSuccess.accountNumber}</p>}
          </div>
          <button onClick={() => setProvisionSuccess(null)} className="ml-auto text-green-500 hover:text-green-700 text-lg leading-none">&times;</button>
        </div>
      )}

      {/* NEW CUSTOMER FORM */}
      {createMode === 'new_customer' && (
        <form onSubmit={handleCreateAccount} className="space-y-8 max-w-3xl">
          {/* Personal Information */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-5">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
                <input required type="text" value={provisionForm.firstName} onChange={e => setProvisionForm({...provisionForm, firstName: e.target.value})} placeholder="Jane" className="w-full border-gray-300 rounded-md shadow-sm text-sm focus:border-brand-blue focus:ring-brand-blue" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label>
                <input required type="text" value={provisionForm.lastName} onChange={e => setProvisionForm({...provisionForm, lastName: e.target.value})} placeholder="Doe" className="w-full border-gray-300 rounded-md shadow-sm text-sm focus:border-brand-blue focus:ring-brand-blue" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="tel" value={provisionForm.phoneNumber} onChange={e => setProvisionForm({...provisionForm, phoneNumber: e.target.value})} placeholder="+1(603)661-9146" className="w-full border-gray-300 rounded-md shadow-sm text-sm focus:border-brand-blue focus:ring-brand-blue" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SSN (Last 4)</label>
                <input type="text" maxLength={4} value={provisionForm.ssnLast4} onChange={e => setProvisionForm({...provisionForm, ssnLast4: e.target.value.replace(/\D/g, '')})} placeholder="0000" className="w-full border-gray-300 rounded-md shadow-sm text-sm focus:border-brand-blue focus:ring-brand-blue font-mono" />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-5">Address</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input type="text" value={provisionForm.address} onChange={e => setProvisionForm({...provisionForm, address: e.target.value})} placeholder="123 Main St" className="w-full border-gray-300 rounded-md shadow-sm text-sm focus:border-brand-blue focus:ring-brand-blue" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input type="text" value={provisionForm.city} onChange={e => setProvisionForm({...provisionForm, city: e.target.value})} placeholder="Austin" className="w-full border-gray-300 rounded-md shadow-sm text-sm focus:border-brand-blue focus:ring-brand-blue" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input type="text" maxLength={2} value={provisionForm.state} onChange={e => setProvisionForm({...provisionForm, state: e.target.value.toUpperCase()})} placeholder="TX" className="w-full border-gray-300 rounded-md shadow-sm text-sm focus:border-brand-blue focus:ring-brand-blue uppercase" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                  <input type="text" maxLength={5} value={provisionForm.zipCode} onChange={e => setProvisionForm({...provisionForm, zipCode: e.target.value.replace(/\D/g, '')})} placeholder="78701" className="w-full border-gray-300 rounded-md shadow-sm text-sm focus:border-brand-blue focus:ring-brand-blue font-mono" />
                </div>
              </div>
            </div>
          </div>

          {/* Login Credentials */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-5">Login Credentials</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
                <input required type="email" value={provisionForm.email} onChange={e => setProvisionForm({...provisionForm, email: e.target.value})} placeholder="jane.doe@example.com" className="w-full border-gray-300 rounded-md shadow-sm text-sm focus:border-brand-blue focus:ring-brand-blue" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
                <input required type="password" value={provisionForm.password} onChange={e => setProvisionForm({...provisionForm, password: e.target.value})} placeholder="Min. 8 characters" className="w-full border-gray-300 rounded-md shadow-sm text-sm focus:border-brand-blue focus:ring-brand-blue" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password <span className="text-red-500">*</span></label>
                <input required type="password" value={provisionForm.confirmPassword} onChange={e => setProvisionForm({...provisionForm, confirmPassword: e.target.value})} placeholder="Re-enter password" className={`w-full border rounded-md shadow-sm text-sm focus:ring-brand-blue ${provisionForm.confirmPassword && provisionForm.password !== provisionForm.confirmPassword ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-brand-blue'}`} />
                {provisionForm.confirmPassword && provisionForm.password !== provisionForm.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>
            </div>
          </div>

          {/* Account Setup */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-5">Initial Account Setup</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Type <span className="text-red-500">*</span></label>
                <select required className="w-full border-gray-300 rounded-md shadow-sm text-sm focus:border-brand-blue focus:ring-brand-blue bg-white" value={provisionForm.accountType} onChange={e => setProvisionForm({...provisionForm, accountType: e.target.value})}>
                  <option value="">Select type...</option>
                  <option value="CHECKING">Checking</option>
                  <option value="SAVINGS">Savings</option>
                  <option value="BUSINESS">Business Checking</option>
                  <option value="CREDIT">Credit Card</option>
                  <option value="HELOC">HELOC</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Initial Balance ($)</label>
                <input type="number" step="0.01" min="0" value={provisionForm.initialBalance} onChange={e => setProvisionForm({...provisionForm, initialBalance: e.target.value})} placeholder="0.00" className="w-full border-gray-300 rounded-md shadow-sm text-sm focus:border-brand-blue focus:ring-brand-blue" />
              </div>

              {provisionForm.accountType === 'CREDIT' && (
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Brand / Tier <span className="text-red-500">*</span></label>
                  <select required className="w-full border-gray-300 rounded-md shadow-sm text-sm focus:border-brand-blue focus:ring-brand-blue bg-white" value={provisionForm.cardBrand} onChange={e => setProvisionForm({...provisionForm, cardBrand: e.target.value})}>
                    <option value="">Select brand...</option>
                    <option value="PLATINUM_ELITE">Redwood Platinum Elite</option>
                    <option value="BLACK_CARD">Redwood Onyx Reserve</option>
                    <option value="REDWOOD_PREFERRED">Redwood Preferred</option>
                  </select>
                </div>
              )}

              {/* Account Number Generator */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                <div className="flex gap-2 items-center">
                  <div className="flex-1 relative">
                    <input type="text" readOnly value={generatedAccNumber ? `${generatedAccNumber.slice(0,4)}-${generatedAccNumber.slice(4,8)}-${generatedAccNumber.slice(8)}` : ''} placeholder='Click "Generate" to assign a number' className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm bg-gray-100 text-gray-800 font-mono cursor-default" />
                    {generatedAccNumber && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-green-600 uppercase tracking-wider">&#10003; Assigned</span>}
                  </div>
                  <button type="button" onClick={generateAccountNumber} className="flex items-center gap-1.5 px-4 py-2 bg-white border-2 border-brand-blue text-brand-blue text-sm font-semibold rounded-md hover:bg-blue-50 transition whitespace-nowrap">
                    <RefreshCw size={14} />
                    {generatedAccNumber ? 'Regenerate' : 'Generate'}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {generatedAccNumber ? `Full number: ${generatedAccNumber} (only last 4 digits shown to the customer)` : 'Optional — the system will auto-generate if left blank.'}
                </p>
              </div>

              {/* Manual Overrides */}
              <div className="sm:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 mt-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-mono text-[11px] uppercase tracking-wider">Custom Opening Date</label>
                  <input type="date" className="w-full border-gray-300 rounded-md shadow-sm text-sm focus:border-brand-blue focus:ring-brand-blue" value={provisionForm.depositDate || ''} onChange={e => setProvisionForm({...provisionForm, depositDate: e.target.value})} />
                </div>
                {(provisionForm.accountType === 'CREDIT' || provisionForm.accountType === 'HELOC') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 font-mono text-[11px] uppercase tracking-wider">Custom Card Expiry (MM/YY)</label>
                    <input type="text" placeholder="04/31" className="w-full border-gray-300 rounded-md shadow-sm text-sm focus:border-brand-blue focus:ring-brand-blue" value={provisionForm.expiryDate || ''} onChange={e => setProvisionForm({...provisionForm, expiryDate: e.target.value})} />
                  </div>
                )}
              </div>
            </div>
          </div>

          <button type="submit" disabled={provisionLoading} className="w-full bg-brand-blue text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-800 transition flex items-center justify-center gap-2 disabled:opacity-60">
            {provisionLoading ? <RefreshCw className="animate-spin" size={18} /> : <PlusCircle size={18} />}
            {provisionLoading ? 'Provisioning...' : 'Create Customer & Account'}
          </button>
        </form>
      )}

      {/* ADD ACCOUNT TO EXISTING USER */}
      {createMode === 'existing_user' && (
        <form onSubmit={handleCreateAccount} className="max-w-xl">
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Add Account to Existing Customer</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Customer <span className="text-red-500">*</span></label>
              <select required className="w-full border-gray-300 rounded-md shadow-sm text-sm focus:border-brand-blue focus:ring-brand-blue bg-white" value={existingAccForm.email} onChange={e => setExistingAccForm({...existingAccForm, email: e.target.value})}>
                <option value="">Select a customer...</option>
                {users.map(u => (
                  <option key={u.id} value={u.email}>{u.firstName} {u.lastName} — {u.email}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Type <span className="text-red-500">*</span></label>
              <select required className="w-full border-gray-300 rounded-md shadow-sm text-sm focus:border-brand-blue focus:ring-brand-blue bg-white" value={existingAccForm.type} onChange={e => setExistingAccForm({...existingAccForm, type: e.target.value})}>
                <option value="">Select type...</option>
                <option value="CHECKING">Checking</option>
                <option value="SAVINGS">Savings</option>
                <option value="BUSINESS">Business Checking</option>
                <option value="CREDIT">Credit Card</option>
                <option value="HELOC">HELOC</option>
              </select>
            </div>
            {existingAccForm.type === 'CREDIT' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Brand / Tier <span className="text-red-500">*</span></label>
                <select required className="w-full border-gray-300 rounded-md shadow-sm text-sm focus:border-brand-blue focus:ring-brand-blue bg-white" value={existingAccForm.cardBrand} onChange={e => setExistingAccForm({...existingAccForm, cardBrand: e.target.value})}>
                  <option value="">Select brand...</option>
                  <option value="PLATINUM_ELITE">Redwood Platinum Elite</option>
                  <option value="BLACK_CARD">Redwood Onyx Reserve</option>
                  <option value="REDWOOD_PREFERRED">Redwood Preferred</option>
                </select>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manual Opening Balance ($)</label>
                <input type="number" step="0.01" placeholder="0.00" className="w-full border-gray-300 rounded-md shadow-sm text-sm focus:border-brand-blue focus:ring-brand-blue" value={existingAccForm.initialBalance || ''} onChange={e => setExistingAccForm({...existingAccForm, initialBalance: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manual Opening Date</label>
                <input type="date" className="w-full border-gray-300 rounded-md shadow-sm text-sm focus:border-brand-blue focus:ring-brand-blue" value={existingAccForm.depositDate || ''} onChange={e => setExistingAccForm({...existingAccForm, depositDate: e.target.value})} />
              </div>
              {(existingAccForm.type === 'CREDIT' || existingAccForm.type === 'HELOC') && (
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manual Card Expiry (MM/YY)</label>
                  <input type="text" placeholder="04/32" className="w-full border-gray-300 rounded-md shadow-sm text-sm focus:border-brand-blue focus:ring-brand-blue" value={existingAccForm.expiryDate || ''} onChange={e => setExistingAccForm({...existingAccForm, expiryDate: e.target.value})} />
                </div>
              )}
            </div>
          </div>
          <button type="submit" className="mt-4 w-full bg-brand-blue text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-800 transition flex items-center justify-center gap-2">
            <PlusCircle size={18} /> Add Account
          </button>
        </form>
      )}
    </div>
  );
};

export default AdminCreate;
