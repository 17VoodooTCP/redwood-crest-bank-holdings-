import { ChevronRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const AccountCard = ({ account, onClick }) => {
  const isCredit = account.type === 'CREDIT';

  return (
    <div 
      onClick={onClick}
      className="card-base group cursor-pointer hover:shadow-md transition-shadow duration-200"
    >
       <div className="p-5">
         <div className="flex justify-between items-start mb-2">
            <h3 className="text-brand-blue font-medium text-base line-clamp-1 group-hover:underline decoration-1 underline-offset-2">
               {account.name} <span className="text-gray-500 font-normal ml-1">...{account.accountNumber}</span>
            </h3>
         </div>
         
         <div className="mt-4">
            <div className="text-sm text-gray-600 mb-1">{isCredit ? 'Current Balance' : 'Available balance'}</div>
            <div className="text-2xl font-light text-brand-text">
               ${Math.abs(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            
            {isCredit && (
              <div className="text-xs text-gray-500 mt-2 flex justify-between">
                 <span>Available credit</span>
                 <span className="font-medium text-gray-700">${account.availableBalance.toLocaleString('en-US')}</span>
              </div>
            )}
         </div>
       </div>

       <div className="bg-gray-50/80 px-5 py-3 border-t border-gray-100 flex justify-between items-center text-sm">
          <NavLink to="/transactions" className="text-brand-blue font-medium group-hover:underline">See full activity</NavLink>
          <ChevronRight size={16} className="text-brand-blue transition-transform transform group-hover:translate-x-1" />
       </div>
    </div>
  );
};

export default AccountCard;
