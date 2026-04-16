import React from 'react';

const BankLogo = ({ size = 'nav' }) => {
  const isNav = size === 'nav';

  return (
    <div
      style={{
        height: isNav ? '48px' : '64px',
        width: isNav ? 'clamp(140px, 30vw, 280px)' : 'clamp(180px, 40vw, 400px)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
      }}
    >
      <img
        src="/logo.png?v=18"
        alt="Redwood Crest"
        style={{
          height: isNav ? '190px' : '250px',
          width: 'auto',
          margin: isNav ? '-71px 0' : '-93px 0',
          maxWidth: 'none',
          objectFit: 'contain',
          filter: 'invert(1) grayscale(1) brightness(2)',
          mixBlendMode: 'screen',
        }}
      />
    </div>
  );
};

export default BankLogo;
