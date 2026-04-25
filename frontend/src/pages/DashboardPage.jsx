import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import AccountCard from '../components/AccountCard';
import CreditCardVisual from '../components/CreditCardVisual';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AlertCircle, Mail } from 'lucide-react';
import { SUPPORT_EMAIL } from '../config/support';

const CHART_COLORS = ['#117aca', '#0e65a8', '#38bdf8', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#6366f1', '#ec4899', '#14b8a6'];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const DashboardPage = () => {
  const { user } = useAuthStore();
  const [accounts, setAccounts] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [spendingData, setSpendingData] = useState([]);

  useEffect(() => {
    document.title = 'Accounts | Redwood Crest Bank';
    const fetchData = async () => {
      try {
        const [accRes, txRes] = await Promise.all([
          api.get('/accounts'),
          api.get('/transactions?limit=100')
        ]);
        setAccounts(accRes.data.accounts);
        setTotalBalance(accRes.data.totalBalance);

        // Build spending breakdown from recent transactions (debits only)
        const txs = txRes.data.transactions || [];
        const categoryMap = {};
        txs.forEach(tx => {
          if (tx.amount < 0) {
            const cat = tx.category || 'Other';
            categoryMap[cat] = (categoryMap[cat] || 0) + Math.abs(tx.amount);
          }
        });
        const chartData = Object.entries(categoryMap)
          .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 8);
        setSpendingData(chartData);
      } catch (err) {
        console.error('Failed to fetch accounts', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <div className="animate-pulse flex p-8 text-brand-blue">Loading your accounts...</div>;
  }

  const depositAccounts = accounts.filter(a => !['CREDIT', 'HELOC', 'AUTO_LOAN', 'MORTGAGE'].includes(a.type));
  const creditAccounts = accounts.filter(a => a.type === 'CREDIT');
  const loanAccounts = accounts.filter(a => ['HELOC', 'AUTO_LOAN', 'MORTGAGE'].includes(a.type));
  const heldAccounts = accounts.filter(a => a.isBlocked);

  const totalSpending = spendingData.reduce((sum, d) => sum + d.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white border border-gray-200 shadow-lg rounded-lg px-4 py-3">
          <p className="text-sm font-semibold text-brand-text">{data.name}</p>
          <p className="text-sm text-gray-600">${data.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-gray-400">{((data.value / totalSpending) * 100).toFixed(1)}% of spending</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-5xl mx-auto">
       <div className="mb-8">
         <h1 className="text-3xl font-light text-brand-text mb-1">{getGreeting()}, {user?.firstName}</h1>
         <div className="text-sm text-gray-600 mb-6">As of {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>

         {heldAccounts.length > 0 && (
           <div className="mb-6 rounded-lg overflow-hidden border border-amber-300 shadow-sm">
             <div className="bg-amber-50 p-5 flex items-start gap-3">
               <div className="bg-amber-100 p-2 rounded-full mt-0.5">
                 <AlertCircle size={20} className="text-amber-700" />
               </div>
               <div className="flex-1">
                 <div className="font-bold text-amber-900 text-base">
                   {heldAccounts.length === 1 ? 'Account on Hold' : `${heldAccounts.length} Accounts on Hold`}
                 </div>
                 <div className="text-sm text-amber-800 mt-1">
                   The following {heldAccounts.length === 1 ? 'account has' : 'accounts have'} been temporarily restricted. You won't be able to transfer, pay, or wire from {heldAccounts.length === 1 ? 'it' : 'them'} until the hold is lifted.
                 </div>
                 <ul className="mt-3 space-y-1.5">
                   {heldAccounts.map(a => (
                     <li key={a.id} className="text-sm text-amber-900">
                       <span className="font-semibold">{a.name} (...{a.accountNumber})</span>
                       {a.blockReason && (
                         <span className="text-amber-700"> — {a.blockReason}</span>
                       )}
                     </li>
                   ))}
                 </ul>
               </div>
             </div>
             <div className="bg-amber-100/60 px-5 py-3 border-t border-amber-200 flex flex-wrap items-center gap-2">
               <Mail size={14} className="text-amber-900" />
               <span className="text-amber-900 text-xs font-semibold">Contact Customer Support:</span>
               <a href={`mailto:${SUPPORT_EMAIL}`} className="text-amber-800 text-xs font-medium underline hover:text-amber-950">
                 {SUPPORT_EMAIL}
               </a>
             </div>
           </div>
         )}

         {/* Portfolio summary for classic banking feel */}
         <div className="bg-white border border-brand-border rounded shadow-sm p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-700 uppercase tracking-wide">Total Deposit Balance</div>
              <div className="text-3xl font-normal text-brand-text mt-1">
                ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('open-assistant'))}
                className="btn-secondary text-sm py-2.5 px-4"
              >
                Ask Assistant
              </button>
              <Link to="/transfer" className="btn-primary text-sm py-2.5 px-4 flex items-center justify-center">
                Make a transfer
              </Link>
            </div>
         </div>
       </div>

       {depositAccounts.length > 0 && (
         <div className="mb-8">
           <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
              <h2 className="text-xl font-medium text-brand-text">Bank accounts</h2>
              <span className="text-sm text-gray-500 font-medium">Total: ${depositAccounts.reduce((a,b)=>a+b.balance,0).toLocaleString('en-US', {minimumFractionDigits:2})}</span>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {depositAccounts.map(acc => (
                <AccountCard key={acc.id} account={acc} />
             ))}
           </div>
         </div>
       )}

       {creditAccounts.length > 0 && (
         <div className="mb-12">
           <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-2">
              <h2 className="text-xl font-medium text-brand-text">Credit accounts</h2>
              <div className="flex gap-4 items-center">
                 <span className="text-sm text-gray-500 font-medium font-sans">
                   Total Available: ${(creditAccounts.reduce((a,b)=>a+(b.creditLimit || 0),0) - Math.abs(creditAccounts.reduce((a,b)=>a+b.balance,0))).toLocaleString('en-US', {minimumFractionDigits:0})}
                 </span>
              </div>
           </div>
           
           <div className="grid grid-cols-1 gap-8">
             {creditAccounts.map(acc => (
               <div key={acc.id} className="flex flex-col lg:flex-row gap-8 items-center bg-white border border-brand-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                  {/* Realistic Physical Card Visual */}
                  <div className="w-full lg:w-auto lg:shrink-0" style={{ maxWidth: '420px' }}>
                     <CreditCardVisual account={acc} />
                  </div>
                  
                  {/* Account Info Details */}
                  <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     <div className="flex flex-col justify-center">
                        <h3 className="text-lg font-medium text-brand-blue mb-2">{acc.name}</h3>
                        <div className="space-y-1">
                           <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Current Balance</p>
                           <p className="text-3xl font-light text-brand-text">${Math.abs(acc.balance).toLocaleString('en-US', {minimumFractionDigits:2})}</p>
                        </div>
                     </div>
                     
                     <div className="flex flex-col justify-center space-y-4">
                        <div className="space-y-0.5">
                           <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">Available Credit</p>
                           <p className="text-xl font-medium text-gray-700">${(acc.availableBalance || 0).toLocaleString('en-US', {minimumFractionDigits:2})}</p>
                        </div>
                        <div className="space-y-0.5">
                           <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">Credit Limit</p>
                           <p className="text-sm font-medium text-gray-600">${(acc.creditLimit || 0).toLocaleString('en-US', {minimumFractionDigits:0})}</p>
                        </div>
                     </div>

                     <div className="flex flex-col justify-center space-y-3">
                        <div className="p-3 bg-brand-light rounded border border-brand-border/40">
                           <p className="text-[10px] text-gray-400 uppercase font-black mb-2 opacity-70">Payment Information</p>
                           <div className="flex justify-between mb-1.5 items-center">
                              <span className="text-[11px] text-gray-600">Next Due:</span>
                              <span className="text-[11px] font-bold text-brand-text">{acc.nextPaymentDue || 'N/A'}</span>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-[11px] text-gray-600">Min. Due:</span>
                              <span className="text-[11px] font-bold text-gray-800">${(acc.minimumPayment || 0).toLocaleString('en-US', {minimumFractionDigits:2})}</span>
                           </div>
                        </div>
                        <Link to="/transactions" className="text-center bg-white border border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white text-[11px] font-bold py-2 rounded transition-all uppercase tracking-wide">
                           Pay card / Activity
                        </Link>
                     </div>
                  </div>
               </div>
             ))}
           </div>
         </div>
       )}

       {loanAccounts.length > 0 && (
         <div className="mb-8">
           <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
              <h2 className="text-xl font-medium text-brand-text">Loans & Lines of Credit</h2>
              <span className="text-sm text-gray-500 font-medium">Outstanding: ${Math.abs(loanAccounts.reduce((a,b)=>a+b.balance,0)).toLocaleString('en-US', {minimumFractionDigits:2})}</span>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {loanAccounts.map(acc => (
                <AccountCard key={acc.id} account={acc} />
             ))}
           </div>
         </div>
       )}

       {/* Spending Summary Chart */}
       {spendingData.length > 0 && (
         <div className="mb-8">
           <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
              <h2 className="text-xl font-medium text-brand-text">Spending summary</h2>
              <span className="text-sm text-gray-500 font-medium">Last 30 days</span>
           </div>
           <div className="card-base p-6 bg-white">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={spendingData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={120}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {spendingData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div>
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 font-medium">Total spending</div>
                    <div className="text-2xl font-semibold text-brand-text">${totalSpending.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                  </div>
                  <div className="space-y-3">
                    {spendingData.map((item, idx) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                          <span className="text-sm text-gray-700">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium text-brand-text">${item.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
           </div>
         </div>
       )}
    </div>
  );
};

export default DashboardPage;
