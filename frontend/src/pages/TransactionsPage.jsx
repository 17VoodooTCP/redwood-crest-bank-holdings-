import { useState, useEffect } from 'react';
import { Search, Filter, Download, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Activity | Redwood Crest Bank';
    const init = async () => {
      try {
        const [txRes, accRes] = await Promise.all([
          api.get('/transactions?limit=100'),
          api.get('/accounts')
        ]);
        setTransactions(txRes.data.transactions);
        setAccounts(accRes.data.accounts);
      } catch (err) {
        console.error('Failed to load transactions');
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const url = `/transactions?limit=100${searchTerm ? `&contains=${encodeURIComponent(searchTerm)}` : ''}${selectedAccount ? `&account=${encodeURIComponent(selectedAccount)}` : ''}`;
      const { data } = await api.get(url);
      setTransactions(data.transactions);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadStatement = () => {
    // Determine which account to generate statement for
    let targetAccId = '';
    
    if (selectedAccount) {
      const match = accounts.find(a => a.name === selectedAccount || a.id === selectedAccount);
      if (match) targetAccId = match.id;
    } else if (accounts.length > 0) {
      targetAccId = accounts[0].id;
    }

    if (!targetAccId) {
      alert('Please select an account to generate an official statement.');
      return;
    }

    // Redirect to high-fidelity statement view
    navigate(`/statement/${targetAccId}`);
  };

  // Compute running balances per account
  const getRunningBalances = () => {
    // Group transactions by account, compute running balance going down oldest → newest, then reverse
    const accountBalances = {};
    accounts.forEach(a => { accountBalances[a.id] = a.balance; });
    
    // The transactions are sorted newest-first. We can compute running balance.
    // For each account: start with current balance => first row = current balance, 
    // then subtract the transaction amount to get the "before" balance for the next row
    const balances = new Array(transactions.length);
    const trackedBalance = {};

    for (let i = 0; i < transactions.length; i++) {
      const tx = transactions[i];
      const accId = tx.accountId || tx.account?.id;
      if (!accId) { balances[i] = null; continue; }
      
      if (!(accId in trackedBalance)) {
        // Find account balance
        const acc = accounts.find(a => a.id === accId);
        trackedBalance[accId] = acc ? acc.balance : null;
      }

      if (trackedBalance[accId] !== null) {
        balances[i] = trackedBalance[accId];
        trackedBalance[accId] -= tx.amount;
      } else {
        balances[i] = null;
      }
    }
    return balances;
  };

  const runningBalances = (!isLoading && transactions.length > 0 && accounts.length > 0) ? getRunningBalances() : [];

  return (
    <div className="max-w-5xl mx-auto h-full pb-10">
        <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 border-b border-brand-border pb-4">
          <div>
             <h1 className="text-3xl font-light text-brand-text mb-2">Activity</h1>
          </div>
          <button 
            onClick={handleDownloadStatement}
            className="text-brand-blue flex items-center space-x-1 text-sm font-medium hover:underline px-3 py-1.5 border border-brand-blue/20 rounded hover:bg-brand-blue/5 transition"
          >
             <Download size={16} />
             <span>Download Official Statement (PDF)</span>
          </button>
        </div>

       <div className="card-base p-4 mb-6">
         <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by merchant, date, or amount..." 
                className="input-field pl-10"
              />
            </div>
            <div className="w-full sm:w-64">
              <select 
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="input-field appearance-none cursor-pointer"
              >
                <option value="">All Accounts</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.name}>{a.name} (...{a.accountNumber})</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-secondary sm:w-auto w-full flex justify-center items-center gap-2">
               <Filter size={18}/>
               <span>Sort & filter</span>
            </button>
         </form>
       </div>

       <div className="card-base">
         {isLoading ? (
            <div className="p-8 text-center text-brand-blue font-medium animate-pulse">Loading activity...</div>
         ) : transactions.length === 0 ? (
            <div className="p-12 text-center text-gray-500">We couldn't find any transactions matching these criteria.</div>
         ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#fcfdfd] border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 tracking-wide">Date</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 tracking-wide">Description</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 tracking-wide">Account</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 tracking-wide text-right">Amount</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 tracking-wide text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {transactions.map((tx, idx) => (
                    <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text">
                          {format(new Date(tx.date), 'MMM d, yyyy')}
                       </td>
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-brand-blue cursor-pointer hover:underline">{tx.description}</span>
                            {tx.pending && (
                              <span className="badge-pending">
                                <Clock size={10} className="mr-1" />
                                Pending
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 capitalize">{tx.category.toLowerCase()}</div>
                       </td>
                       <td className="px-6 py-4 text-sm text-gray-500">
                          ...{tx.account.accountNumber}
                       </td>
                       <td className={`px-6 py-4 text-sm font-medium text-right whitespace-nowrap ${tx.amount < 0 ? 'text-brand-text' : 'text-green-600'}`}>
                          {tx.amount > 0 ? '+' : '−'}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                       </td>
                       <td className="px-6 py-4 text-sm text-gray-500 text-right whitespace-nowrap">
                         {runningBalances[idx] != null 
                           ? `$${Math.abs(runningBalances[idx]).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                           : '-'}
                       </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
         )}
       </div>
    </div>
  );
};

export default TransactionsPage;
