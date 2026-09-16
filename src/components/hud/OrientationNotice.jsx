/**
 * OrientationNotice.jsx
 * Non-intrusive floating indicator recommending landscape orientation on mobile devices
 * during gameplay, while allowing seamless portrait play if dismissed or ignored.
 */

import React, { useState, useEffect } from 'react';

/**
 * Renders the orientation guidance banner when a mobile device is in portrait orientation.
 */
export function OrientationNotice() {
  const [isPortrait, setIsPortrait] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check initial orientation and mobile screen width
    function fn_checkOrientation() {
      const tmp_portraitMql = window.matchMedia('(orientation: portrait)').matches;
      const tmp_isMobileWidth = window.innerWidth <= 860;
      setIsPortrait(tmp_portraitMql && tmp_isMobileWidth);
    }

    fn_checkOrientation();
    window.addEventListener('resize', fn_checkOrientation);
    window.addEventListener('orientationchange', fn_checkOrientation);

    return () => {
      window.removeEventListener('resize', fn_checkOrientation);
      window.removeEventListener('orientationchange', fn_checkOrientation);
    };
  }, []);

  if (!isPortrait || isDismissed) {
    return null;
  }

  return (
    <aside className="orientation-notice" aria-live="polite">
      <div className="orientation-notice__content">
        <span className="orientation-notice__icon">🔄</span>
        <span className="orientation-notice__text">
          Rotate to landscape for optimal train view
        </span>
        <button
          type="button"
          className="orientation-notice__close-btn"
          onClick={() => setIsDismissed(true)}
          title="Dismiss notice"
          aria-label="Dismiss orientation notice"
        >
          ✕
        </button>
      </div>
    </aside>
  );
}

export default OrientationNotice;
