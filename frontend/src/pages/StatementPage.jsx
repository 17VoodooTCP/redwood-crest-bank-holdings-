import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Printer, Download, ArrowLeft, ShieldCheck } from 'lucide-react';
import api from '../services/api';

const StatementPage = () => {
  const { accountId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const month = searchParams.get('month') || (new Date().getMonth() + 1);
  const year = searchParams.get('year') || new Date().getFullYear();

  useEffect(() => {
    const fetchStatement = async () => {
      try {
        const { data } = await api.get(`/accounts/${accountId}/statement?month=${month}&year=${year}`);
        setData(data);
      } catch (err) {
        console.error('Failed to load statement', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStatement();
  }, [accountId, month, year]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) return <div className="p-20 text-center font-serif text-gray-400 uppercase tracking-widest animate-pulse">Authenticating Statement Data...</div>;
  if (!data) return <div className="p-20 text-center text-red-600">Statement not available for this period.</div>;

  const { account, summary, period, transactions } = data;

  return (
    <div className="min-h-screen bg-neutral-100 py-10 print:bg-white print:py-0">
      {/* TOOLBAR - HIDDEN DURING PRINT */}
      <div className="max-w-[8.5in] mx-auto mb-6 flex justify-between items-center print:hidden px-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-brand-blue transition">
          <ArrowLeft size={18} />
          <span className="font-medium text-sm">Back to Activity</span>
        </button>
        <div className="flex gap-3">
          <button onClick={handlePrint} className="bg-brand-blue text-white px-5 py-2 rounded shadow-md hover:bg-blue-800 transition flex items-center gap-2 font-medium text-sm">
            <Printer size={16} /> Print / Save as PDF
          </button>
        </div>
      </div>

      {/* ACTUAL STATEMENT DOCUMENT */}
      <div className="max-w-[8.5in] mx-auto bg-white shadow-2xl min-h-[11in] p-[0.75in] print:shadow-none print:m-0 print:p-[0.5in] font-serif text-[#333]">
        
        {/* HEADER SECTION */}
        <div className="flex justify-between items-start border-b-2 border-brand-blue pb-8 mb-8">
          <div>
            <div style={{ height: '48px', width: '260px', overflow: 'hidden', display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
              <img src={`/logo.png?v=${Date.now()}`} alt="Redwood Crest Bank" style={{ height: '190px', width: 'auto', margin: '-71px 0', maxWidth: 'none', objectFit: 'contain' }} />
            </div>
            <div className="text-[10pt] leading-tight text-gray-600 uppercase font-sans font-bold tracking-tighter">
              Redwood Crest Bank, N.A.<br/>
              P.O. Box 12345<br/>
              Wilmington, DE 19801-1234
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold font-sans text-brand-blue uppercase tracking-tight mb-1">Account Statement</h1>
            <div className="text-[10pt] font-sans text-gray-700">
               Statement Period: {format(new Date(period.start), 'MMMM d, yyyy')} to {format(new Date(period.end), 'MMMM d, yyyy')}<br/>
               Account Number: &nbsp; <span className="font-bold">...{account.accountNumber}</span>
            </div>
          </div>
        </div>

        {/* CUSTOMER INFO */}
        <div className="mb-12 text-[11pt]">
          <div className="font-bold mb-1 uppercase font-sans tracking-wide">{account.user.firstName} {account.user.lastName}</div>
          <div className="uppercase leading-snug">
            {account.user.address}<br/>
            {account.user.city}, {account.user.state} {account.user.zipCode}
          </div>
        </div>

        {/* ACCOUNT SUMMARY BOX */}
        <div className="mb-10">
          <h2 className="text-[13pt] font-bold font-sans border-b border-gray-300 pb-1 mb-4 uppercase tracking-tight">Account Summary</h2>
          <div className="grid grid-cols-4 gap-0 border border-gray-200">
            <div className="p-4 border-r border-gray-200 bg-gray-50/50">
              <div className="text-[8pt] uppercase font-bold text-gray-500 mb-1 font-sans">Beginning Balance</div>
              <div className="text-[14pt] font-sans">${summary.beginningBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
            </div>
            <div className="p-4 border-r border-gray-200">
              <div className="text-[8pt] uppercase font-bold text-gray-500 mb-1 font-sans">Deposits/Credits</div>
              <div className="text-[14pt] font-sans text-green-700">+${summary.deposits.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
            </div>
            <div className="p-4 border-r border-gray-200">
              <div className="text-[8pt] uppercase font-bold text-gray-500 mb-1 font-sans">Withdrawals/Debits</div>
              <div className="text-[14pt] font-sans">-${summary.withdrawals.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
            </div>
            <div className="p-4 bg-brand-blue/5">
              <div className="text-[8pt] uppercase font-bold text-brand-blue mb-1 font-sans">Ending Balance</div>
              <div className="text-[14pt] font-sans font-bold">${summary.endingBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
            </div>
          </div>
        </div>

        {/* TRANSACTION DETAIL */}
        <div className="mb-12">
          <h2 className="text-[13pt] font-bold font-sans border-b border-gray-300 pb-1 mb-4 uppercase tracking-tight">Transaction Detail</h2>
          <table className="w-full text-left text-[10pt] border-collapse font-sans">
            <thead>
              <tr className="border-b-2 border-gray-200 text-gray-500 uppercase text-[8pt]">
                <th className="py-2 font-bold">Date</th>
                <th className="py-2 font-bold">Description</th>
                <th className="py-2 font-bold text-right">Amount</th>
                <th className="py-2 font-bold text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
               {/* Use a running balance calculation for the table display */}
               {(() => {
                  let currentBalance = summary.endingBalance;
                  return transactions.map((tx, idx) => {
                    const displayBalance = currentBalance;
                    currentBalance -= tx.amount;
                    return (
                      <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                        <td className="py-3 pr-4 whitespace-nowrap">{format(new Date(tx.date), 'MM/dd')}</td>
                        <td className="py-3 font-medium uppercase tracking-tighter text-[9pt]">{tx.description}</td>
                        <td className={`py-3 text-right font-medium ${tx.amount > 0 ? 'text-green-700' : ''}`}>
                          {tx.amount > 0 ? '' : '-'}{Math.abs(tx.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </td>
                        <td className="py-3 text-right text-gray-500">
                          {displayBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </td>
                      </tr>
                    );
                  });
               })()}
               {transactions.length === 0 && (
                 <tr>
                   <td colSpan="4" className="py-10 text-center text-gray-400 italic">No transactions during this period.</td>
                 </tr>
               )}
            </tbody>
          </table>
        </div>

        {/* MESSAGES / DISCLOSURES */}
        <div className="mt-auto border-t-2 border-gray-100 pt-8">
           <div className="flex items-center gap-2 mb-4 text-brand-blue">
              <ShieldCheck size={20} />
              <span className="font-sans font-bold text-[10pt] uppercase tracking-widest">Secure Document</span>
           </div>
           <p className="text-[8pt] text-gray-500 leading-relaxed font-sans mb-4">
             IMPORTANT INFORMATION: This statement is a formal record of your account activity. Please review it carefully. 
             If you find any errors or have questions about a transaction, contact us within 60 days. 
             Redwood Crest Bank is a Member FDIC and Equal Housing Lender.
           </p>
           <div className="text-[7pt] text-gray-400 font-sans uppercase">
             RC-STMT-AUTO-2024 REV C | Page 1 of 1
           </div>
        </div>
      </div>
    </div>
  );
};

export default StatementPage;
