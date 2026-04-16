import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Resets both horizontal AND vertical scroll to (0, 0) on every route change.
 *
 * React Router v6 does not restore or reset scroll position when navigating
 * between routes. On iOS Safari this can leave the page horizontally scrolled
 * (if any page previously had overflow), making the dark header/footer appear
 * narrower than the full screen width.
 *
 * useLayoutEffect runs synchronously BEFORE the browser paints, so the user
 * never sees a flash of the wrong scroll position.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    try {
      window.scrollTo(0, 0);
      document.documentElement.scrollLeft = 0;
      document.body.scrollLeft = 0;
    } catch (_) {
      // Silently ignore — scroll reset is best-effort
    }
  }, [pathname]);

  return null;
}
