import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { CreditCard, Zap, Wifi } from 'lucide-react';
import amexBg from '../assets/amex-bg.png';

const CreditCardVisual = ({ account }) => {
  const { user } = useAuthStore();
  
  // Card Brand / Style identification logic
  const getCardStyle = () => {
    // CRASH-PROOF: Ensure name exists before string operations
    const name = account?.name?.toUpperCase() || '';
    
    if (name.includes('AMERICAN EXPRESS PLATINUM') || name.includes('AMEX')) {
      return {
        type: 'AMEX_PLATINUM',
        brandName: 'AMERICAN EXPRESS',
        isAmex: true
      };
    }
    if (name.includes('CENTURION BLACK') || name.includes('BLACK CARD')) {
      return {
        background: 'linear-gradient(135deg, #18181b 0%, #09090b 50%, #27272a 100%)',
        textColor: '#f4f4f5',
        secondaryColor: '#a1a1aa',
        type: 'BLACK_CARD',
        brandName: 'CENTURION',
        isBlack: true
      };
    }
    if (name.includes('SAPPHIRE RESERVE') || name.includes('SAPPHIRE')) {
      return {
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1e3a8a 100%)',
        textColor: '#ffffff',
        secondaryColor: '#93c5fd',
        type: 'SAPPHIRE_RESERVE',
        brandName: 'CHASE SAPPHIRE',
        isSapphire: true
      };
    }
    return {
      background: 'linear-gradient(135deg, #117aca 0%, #0e65a8 100%)',
      textColor: '#ffffff',
      secondaryColor: '#e2e8f0',
      type: 'DEFAULT',
      brandName: 'BANK CARD'
    };
  };

  const style = getCardStyle();
  const holderName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim().toUpperCase() || 'VALUED CUSTOMER';
  
  // CRASH-PROOF: Ensure accountNumber exists
  const maskedNumber = style.isAmex 
    ? `**** ****** *${account?.accountNumber || '0000'}` 
    : `**** **** **** ${account?.accountNumber || '0000'}`;

  // ABSOLUTE FIDELITY AMEX PLATINUM (IMAGE-BASED)
  if (style.isAmex) {
    return (
      <div className="relative group overflow-hidden shadow-2xl transition-all duration-700 hover:shadow-gray-400/40 active:scale-[0.99] border border-gray-400 w-full"
           style={{
             width: '100%',
             maxWidth: '420px',
             height: 'auto',
             aspectRatio: '420 / 265',
             borderRadius: '16px',
             backgroundColor: '#1f2937', 
             backgroundImage: `url(${amexBg})`, 
             backgroundSize: '100% 100%',
             backgroundPosition: 'center',
             backgroundRepeat: 'no-repeat',
             fontFamily: "'Inter', sans-serif"
           }}>
        
        {/* Dynamic Data Overlays */}
        <div className="relative h-full w-full pointer-events-none">
          {/* Pro Metallic Patch: Perfectly covers the 'C F FROST' text area */}
          <div className="absolute bottom-[6.5%] left-[8%] w-[280px] h-[40px] rounded-sm blur-[1px] opacity-98"
               style={{
                 background: 'linear-gradient(90deg, #b5b7ba 0%, #cfd1d4 50%, #b5b7ba 100%)',
                 boxShadow: '0 0 15px 5px #c0c2c5'
               }} />

          {/* Cardmember Name - More realistic scale and spacing */}
          <div className="absolute bottom-[8.3%] left-[10%]">
             <p className="text-[16px] font-mono tracking-[0.1em] font-black text-black/90 transform scale-y-105 drop-shadow-sm uppercase">
               {holderName}
             </p>
          </div>
        </div>

        {/* Dynamic Material Light Effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent transition-opacity duration-300 opacity-0 group-hover:opacity-100 pointer-events-none" />
        
        {/* Material Edge Reflection */}
        <div className="absolute inset-0 rounded-[16px] border border-white/20 pointer-events-none shadow-[inset_0_0_15px_rgba(255,255,255,0.1)]" />
      </div>
    );
  }

  // STANDARD RENDERING (Visa/MC/Chase)
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
