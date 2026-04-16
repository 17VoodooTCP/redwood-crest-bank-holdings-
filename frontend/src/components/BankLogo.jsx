import React from 'react';

const BankLogo = ({ size = 'nav' }) => {
  const isNav = size === 'nav';

  // Cropping technique: the logo.png has ~60% whitespace padding.
  // To get 48px of visible content, we render the image at ~190px and crop with overflow:hidden.
  // The invert+screen blend removes the white background seamlessly.
  return (
    <div
      style={{
        height: isNav ? '48px' : '64px',
        width: isNav ? '280px' : '400px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
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
