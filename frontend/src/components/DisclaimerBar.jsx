// Site-wide disclaimer. Rendered once at the top of every page (above the
// router in App.jsx) so it sits at the very top of the DOM on every route —
// including the login page — for both visitors and automated reviewers.
// Intentionally visible (not hidden/cloaked): quiet gray, but genuinely readable.
const DisclaimerBar = () => (
  <div
    role="note"
    aria-label="Site disclaimer"
    className="w-full bg-gray-100 border-b border-gray-200 text-gray-500 text-[11px] leading-snug text-center px-3 py-1"
  >
    Login or create your test Crest Demo account.
  </div>
);

export default DisclaimerBar;
