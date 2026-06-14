import React from 'react';

/**
 * BankLogo
 * --------
 * Uses `/logo-mark.png` — the wordmark + airplane mark cropped tight to its
 * content (723×139, ≈5.2:1), so there is no surrounding whitespace to fight.
 *
 * Strategy:
 *   1. Container is sized by height (fluid `clamp()`), width derived from the
 *      asset's real aspect ratio — so the whole wordmark always fits, on every
 *      viewport, with nothing clipped on desktop or mobile.
 *   2. `object-fit: contain` keeps it crisp; no over-scaling, no overflow clip.
 *   3. The invert + screen blend turns the black wordmark white over the dark
 *      navy bars it sits on (TopNav, InfoPageShell) while dropping the white bg.
 */
const BankLogo = ({ size = 'nav' }) => {
  const isNav = size === 'nav';

  // Tunable per-size height envelope. Width follows from aspect-ratio.
  const minH = isNav ? 22 : 36;     // readable floor on iPhone SE (320px wide)
  const fluidH = isNav ? '4.2vw' : '6vw';
  const maxH = isNav ? 34 : 52;

  return (
    <div
      style={{
        height: `clamp(${minH}px, ${fluidH}, ${maxH}px)`,
        aspectRatio: '723 / 139',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <img
        src="/logo-mark.png?v=1"
        alt="Redwood Crest"
        style={{
          height: '100%',
          width: '100%',
          objectFit: 'contain',
          filter: 'invert(1) grayscale(1) brightness(2)',
          mixBlendMode: 'screen',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
        draggable={false}
      />
    </div>
  );
};

export default BankLogo;
