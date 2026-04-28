import React from 'react';

/**
 * BankLogo
 * --------
 * The source asset (`/logo.png`, 1024×682) contains the "REDWOOD CREST" wordmark
 * plus the airplane-diamond mark inside roughly the central 625×140 region —
 * the rest of the canvas is whitespace.
 *
 * Strategy:
 *   1. Size the container to the *visible content's* aspect ratio (~4.5:1)
 *      so it scales cleanly on every viewport.
 *   2. Over-scale the image inside the container (`height: 460%`) so the
 *      surrounding whitespace is what gets clipped — never the wordmark or mark.
 *   3. Use `clamp()` on the height so it has a sensible floor on tiny phones
 *      (iPhone SE / Android compact) and a ceiling on tablets+.
 */
const BankLogo = ({ size = 'nav' }) => {
  const isNav = size === 'nav';

  // Tunable per-size envelope. Width is derived from height via aspect-ratio.
  const minH = isNav ? 28 : 44;     // 28px ≈ readable + tight enough for iPhone SE (320px)
  const fluidH = isNav ? '5.6vw' : '8vw';
  const maxH = isNav ? 44 : 64;

  return (
    <div
      style={{
        height: `clamp(${minH}px, ${fluidH}, ${maxH}px)`,
        aspectRatio: '4.5 / 1',
        flexShrink: 0,           // never compress below natural aspect — clips the wordmark otherwise
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <img
        src="/logo.png?v=18"
        alt="Redwood Crest"
        style={{
          height: '460%',         // over-scale → clip whitespace, keep content visible
          width: 'auto',
          maxWidth: 'none',
          objectFit: 'contain',
          filter: 'invert(1) grayscale(1) brightness(2)',
          mixBlendMode: 'screen',
          // Prevent iOS Safari from inflating image rendering
          userSelect: 'none',
          pointerEvents: 'none',
        }}
        draggable={false}
      />
    </div>
  );
};

export default BankLogo;
