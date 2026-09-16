/**
 * Button.jsx
 * Tactile industrial push-button component with sound effects and active states.
 */

import React from 'react';
import { obj_AUDIO_MANAGER, obj_SOUND_MANAGER } from '../game/audio/index.js';

/**
 * Renders an interactive game button with tactile styling and audio feedback.
 */
export function Button({
  children,
  onClick,
  variant = 'primary', // 'primary', 'secondary', 'danger', 'warning', 'icon'
  disabled = false,
  className = '',
  title = '',
  id = '',
}) {
  /**
   * Handles button click with synthesized click feedback.
   */
  function handleClick(e) {
    if (disabled) return;
    obj_AUDIO_MANAGER.init();
    obj_AUDIO_MANAGER.playButtonClick();
    if (onClick) onClick(e);
  }

  const tmp_baseClass = 'iron-btn';
  const tmp_variantClass = `iron-btn--${variant}`;
  const tmp_combinedClass = `${tmp_baseClass} ${tmp_variantClass} ${className}`.trim();

  return (
    <button
      id={id}
      type="button"
      className={tmp_combinedClass}
      onClick={handleClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  );
}
