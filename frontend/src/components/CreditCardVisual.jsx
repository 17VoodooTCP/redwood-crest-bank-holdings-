import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { CreditCard, Zap, Wifi } from 'lucide-react';

const CreditCardVisual = ({ account }) => {
  const { user } = useAuthStore();

  // Card Brand / Style identification logic
  const getCardStyle = () => {
    // CRASH-PROOF: Ensure name exists before string operations
    const name = account?.name?.toUpperCase() || '';

    if (name.includes('PLATINUM ELITE') || name.includes('PLATINUM_ELITE')) {
      return {
        background: 'linear-gradient(135deg, #d1d5db 0%, #9ca3af 50%, #6b7280 100%)',
        textColor: '#111827',
        secondaryColor: '#374151',
        type: 'PLATINUM_ELITE',
        brandName: 'REDWOOD PLATINUM ELITE',
        isPremium: true
      };
    }
    if (name.includes('ONYX RESERVE') || name.includes('BLACK CARD') || name.includes('BLACK_CARD')) {
      return {
        background: 'linear-gradient(135deg, #18181b 0%, #09090b 50%, #27272a 100%)',
        textColor: '#f4f4f5',
        secondaryColor: '#a1a1aa',
        type: 'BLACK_CARD',
        brandName: 'REDWOOD ONYX',
        isBlack: true
      };
    }
    if (name.includes('REDWOOD PREFERRED') || name.includes('REDWOOD_PREFERRED')) {
      return {
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1e3a8a 100%)',
        textColor: '#ffffff',
        secondaryColor: '#93c5fd',
        type: 'REDWOOD_PREFERRED_RESERVE',
        brandName: 'REDWOOD PREFERRED',
        isPremium: true
      };
    }
    return {
      background: 'linear-gradient(135deg, #117aca 0%, #0e65a8 100%)',
      textColor: '#ffffff',
      secondaryColor: '#e2e8f0',
      type: 'DEFAULT',
      brandName: 'REDWOOD CREST'
    };
  };

  const style = getCardStyle();
  const holderName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim().toUpperCase() || 'VALUED CUSTOMER';

  // CRASH-PROOF: Ensure accountNumber exists
  const maskedNumber = `**** **** **** ${account?.accountNumber || '0000'}`;

  // STANDARD RENDERING (Visa/MC)
  return (
    <div className="relative group overflow-hidden shadow-2xl transition-all duration-500 hover:scale-[1.02] border border-black/10 w-full"
         style={{
           width: '100%',
           maxWidth: '360px',
           height: 'auto',
           aspectRatio: '360 / 227',
           borderRadius: '14px',
           background: style.background 
         }}>
      
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 80%)' }} />
      
      <div className="relative h-full p-6 flex flex-col justify-between text-shadow text-white" 
           style={{ color: style.textColor }}>
        
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold tracking-[0.2em] opacity-80 uppercase">
               {style.brandName}
            </span>
          </div>
          <div className="w-10 h-8 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-md shadow-inner flex items-center justify-center border border-yellow-400/50">
             <div className="w-full h-full p-1.5 grid grid-cols-2 gap-0.5 opacity-60">
                <div className="border border-yellow-800/30 rounded-[1px]" />
                <div className="border border-yellow-800/30 rounded-[1px]" />
                <div className="border border-yellow-800/30 rounded-[1px]" />
                <div className="border border-yellow-800/30 rounded-[1px]" />
             </div>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-3">
           <Wifi size={16} className="rotate-90 opacity-40 ml-1" />
           <div className="flex-1">
              <p className="text-xl font-medium tracking-[0.15em] font-mono">
                {maskedNumber}
              </p>
           </div>
        </div>

        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-0.5 text-left">
            <p className="text-[11px] font-medium opacity-60 mb-1">CARDMEMBER NAME</p>
            <p className="text-sm font-bold tracking-wider">
               {holderName}
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-1">
             <div className="flex flex-col items-end">
                <span className="text-[7px] font-bold opacity-50 uppercase">Good Thru</span>
                <span className="text-xs font-mono">{account?.expiryDate || '04/31'}</span>
             </div>
             
             <div className="mt-1">
                {style.isBlack ? (
                   <div className="px-2 py-0.5 border border-zinc-700 rounded bg-black flex items-center justify-center">
                     <span className="text-[10px] font-serif font-bold text-zinc-400 leading-none">VISA</span>
                   </div>
                ) : (
                   <div className="flex items-center">
                      <div className="w-5 h-5 bg-red-600 rounded-full opacity-80" />
                      <div className="w-5 h-5 bg-orange-500 rounded-full -ml-3 opacity-90" />
                   </div>
                )}
             </div>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
    </div>
  );
};

export default CreditCardVisual;
