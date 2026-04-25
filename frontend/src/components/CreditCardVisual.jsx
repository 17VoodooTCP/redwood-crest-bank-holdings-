import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Wifi } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
   Card tier styles — background, foreground, brand label.
   ─────────────────────────────────────────────────────────────────────────── */
const TIER_STYLES = {
  PLATINUM_ELITE: {
    background: `
      radial-gradient(circle at 25% 20%, rgba(226, 232, 240, 0.22) 0%, transparent 55%),
      radial-gradient(circle at 80% 90%, rgba(148, 163, 184, 0.18) 0%, transparent 50%),
      linear-gradient(135deg, #0A1E3F 0%, #142C56 30%, #1E3A6E 50%, #142C56 70%, #06132A 100%)
    `,
    textColor: '#F1F5F9',
    secondaryColor: '#CBD5E1',
    brandName: 'REDWOOD PLATINUM ELITE',
    logoFilter: 'invert(1) grayscale(1) brightness(2)',
  },
  BLACK_CARD: {
    background: 'linear-gradient(135deg, #18181b 0%, #09090b 50%, #27272a 100%)',
    textColor: '#f4f4f5',
    secondaryColor: '#a1a1aa',
    brandName: 'REDWOOD ONYX',
    logoFilter: 'invert(1) grayscale(1) brightness(2)',
  },
  REDWOOD_PREFERRED: {
    background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1e3a8a 100%)',
    textColor: '#ffffff',
    secondaryColor: '#93c5fd',
    brandName: 'REDWOOD PREFERRED',
    logoFilter: 'invert(1) grayscale(1) brightness(2)',
  },
  AMEX_PLATINUM: {
    background: 'linear-gradient(135deg, #e5e7eb 0%, #cbd5e1 45%, #94a3b8 100%)',
    textColor: '#0f172a',
    secondaryColor: '#475569',
    brandName: 'AMERICAN EXPRESS PLATINUM',
    logoFilter: 'grayscale(1) brightness(0.3)',
  },
  DEFAULT: {
    background: 'linear-gradient(135deg, #0A1E3F 0%, #06132A 100%)',
    textColor: '#ffffff',
    secondaryColor: '#cbd5e1',
    brandName: 'REDWOOD CREST',
    logoFilter: 'invert(1) grayscale(1) brightness(2)',
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
   Network logos — minimal SVG/CSS marks (not pixel-exact brand assets)
   ─────────────────────────────────────────────────────────────────────────── */
const VisaLogo = () => (
  <div style={{
    background: '#1A1F71',
    padding: '4px 10px',
    borderRadius: '4px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
  }}>
    <span style={{
      color: '#F7B600',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
      fontWeight: 900,
      fontSize: '14px',
      letterSpacing: '0.5px',
      lineHeight: 1,
    }}>VISA</span>
  </div>
);

const MasterCardLogo = () => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <div style={{
      width: '22px', height: '22px',
      background: '#EB001B', borderRadius: '50%',
      boxShadow: '0 1px 2px rgba(0,0,0,0.25)',
    }} />
    <div style={{
      width: '22px', height: '22px',
      background: '#F79E1B', borderRadius: '50%',
      marginLeft: '-10px',
      mixBlendMode: 'multiply',
      boxShadow: '0 1px 2px rgba(0,0,0,0.25)',
    }} />
  </div>
);

const AmexLogo = () => (
  <div style={{
    background: '#2E77BC',
    padding: '4px 7px',
    borderRadius: '3px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
  }}>
    <div style={{
      color: '#fff',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 700,
      fontSize: '7px',
      letterSpacing: '0.3px',
      lineHeight: 1.1,
      textAlign: 'center',
    }}>
      AMERICAN<br />EXPRESS
    </div>
  </div>
);

const RedwoodLogo = () => (
  <div style={{
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #FFE066 0%, #D4AF37 35%, #B8860B 65%, #FFD700 100%)',
    border: '1.5px solid #D4AF37',
    boxShadow: '0 2px 5px rgba(0,0,0,0.35), inset 0 1px 1.5px rgba(255,255,255,0.55), inset 0 -1px 1px rgba(0,0,0,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }}>
    {/* Stylized Redwood Crest mark — rotated diamond with airplane silhouette */}
    <svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="6" width="20" height="20" rx="3"
            transform="rotate(45 16 16)" fill="#0A1E3F" />
      <path d="M16 9.5 L17.6 14.4 L22.5 16 L17.6 17.6 L16 22.5 L14.4 17.6 L9.5 16 L14.4 14.4 Z"
            fill="#FFFFFF" />
    </svg>
  </div>
);

function getNetworkLogo(network) {
  switch ((network || '').toUpperCase()) {
    case 'VISA': return <VisaLogo />;
    case 'MASTERCARD': return <MasterCardLogo />;
    case 'AMEX': return <AmexLogo />;
    case 'REDWOOD': return <RedwoodLogo />;
    default: return <MasterCardLogo />;
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   Tier resolution — prefer stored cardBrand, fall back to name parsing
   so legacy accounts (without cardBrand) still render correctly.
   ─────────────────────────────────────────────────────────────────────────── */
function resolveTier(account) {
  if (account?.cardBrand && TIER_STYLES[account.cardBrand]) return account.cardBrand;
  const name = account?.name?.toUpperCase() || '';
  if (name.includes('PLATINUM ELITE') || name.includes('PLATINUM_ELITE')) return 'PLATINUM_ELITE';
  if (name.includes('ONYX') || name.includes('BLACK CARD') || name.includes('BLACK_CARD')) return 'BLACK_CARD';
  if (name.includes('AMERICAN EXPRESS') || name.includes('AMEX')) return 'AMEX_PLATINUM';
  if (name.includes('REDWOOD PREFERRED') || name.includes('REDWOOD_PREFERRED') || name.includes('PREFERRED')) return 'REDWOOD_PREFERRED';
  return 'DEFAULT';
}

function resolveNetwork(account, tier) {
  if (account?.cardNetwork) return account.cardNetwork.toUpperCase();
  // Sensible defaults if no network is stored yet
  if (tier === 'AMEX_PLATINUM') return 'AMEX';
  if (tier === 'BLACK_CARD') return 'REDWOOD';
  return 'MASTERCARD';
}

/* ─────────────────────────────────────────────────────────────────────────── */
const CreditCardVisual = ({ account }) => {
  const { user } = useAuthStore();

  const tier = resolveTier(account);
  const style = TIER_STYLES[tier];
  const network = resolveNetwork(account, tier);

  const holderName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim().toUpperCase() || 'VALUED CUSTOMER';
  const maskedNumber = `**** **** **** ${account?.accountNumber || '0000'}`;

  return (
    <div className="rwd-card-wrapper" style={{ perspective: '1200px', width: '100%', maxWidth: '360px' }}>
      <div
        className="rwd-card relative overflow-hidden border border-black/10"
        style={{
          width: '100%',
          aspectRatio: '360 / 227',
          borderRadius: '14px',
          background: style.background,
          boxShadow: '0 12px 24px -10px rgba(0,0,0,0.35), 0 6px 14px -8px rgba(0,0,0,0.25)',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
          willChange: 'transform',
        }}
      >
        {/* Embossed bank logo watermark */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '75%',
            opacity: 0.07,
            mixBlendMode: 'overlay',
          }}
        >
          <img
            src="/logo.png?v=18"
            alt=""
            style={{
              width: '100%',
              height: 'auto',
              filter: style.logoFilter,
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>

        {/* Soft radial highlight */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.18) 0%, transparent 60%)',
          }}
        />

        {/* Shine sweep on hover */}
        <div className="rwd-card-shine absolute inset-0 pointer-events-none" />

        {/* Foreground content */}
        <div className="relative h-full p-6 flex flex-col justify-between" style={{ color: style.textColor }}>

          {/* Top row: brand label + chip */}
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold tracking-[0.2em] opacity-80 uppercase">
              {style.brandName}
            </span>
            <div className="w-10 h-8 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-md shadow-inner flex items-center justify-center border border-yellow-400/50">
              <div className="w-full h-full p-1.5 grid grid-cols-2 gap-0.5 opacity-60">
                <div className="border border-yellow-800/30 rounded-[1px]" />
                <div className="border border-yellow-800/30 rounded-[1px]" />
                <div className="border border-yellow-800/30 rounded-[1px]" />
                <div className="border border-yellow-800/30 rounded-[1px]" />
              </div>
            </div>
          </div>

          {/* Middle: contactless + masked number */}
          <div className="mt-2 flex items-center gap-3">
            <Wifi size={16} className="rotate-90 opacity-40 ml-1" />
            <p className="text-xl font-medium tracking-[0.15em] font-mono">
              {maskedNumber}
            </p>
          </div>

          {/* Bottom: name / expiry / network */}
          <div className="flex justify-between items-end">
            <div className="flex flex-col gap-0.5 text-left">
              <p className="text-[11px] font-medium opacity-60 mb-1">CARDMEMBER NAME</p>
              <p className="text-sm font-bold tracking-wider">{holderName}</p>
            </div>

            <div className="flex flex-col items-end gap-1">
              <div className="flex flex-col items-end">
                <span className="text-[7px] font-bold opacity-50 uppercase">Good Thru</span>
                <span className="text-xs font-mono">{account?.expiryDate || '04/31'}</span>
              </div>
              <div className="mt-1">{getNetworkLogo(network)}</div>
            </div>
          </div>
        </div>

        {/* Subtle top-right gradient sheen (always-on) */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
      </div>

      {/* Hover animations — 3D tilt + shine sweep */}
      <style>{`
        .rwd-card-wrapper:hover .rwd-card {
          transform: rotateY(-7deg) rotateX(5deg) scale(1.025);
          box-shadow:
            0 30px 60px -15px rgba(0,0,0,0.5),
            0 18px 36px -18px rgba(0,0,0,0.55);
        }
        .rwd-card-shine {
          background: linear-gradient(
            105deg,
            transparent 30%,
            rgba(255,255,255,0.22) 45%,
            rgba(255,255,255,0.38) 50%,
            rgba(255,255,255,0.22) 55%,
            transparent 70%
          );
          transform: translateX(-110%);
          transition: transform 0.95s cubic-bezier(0.23, 1, 0.32, 1);
          mix-blend-mode: overlay;
        }
        .rwd-card-wrapper:hover .rwd-card-shine {
          transform: translateX(110%);
        }
      `}</style>
    </div>
  );
};

export default CreditCardVisual;
