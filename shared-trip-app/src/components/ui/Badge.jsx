import React from 'react';
import './ui.css';

const BADGE_VARIANTS = {
  default: 'ui-badge-default',
  success: 'ui-badge-success',
  warning: 'ui-badge-warning',
  danger: 'ui-badge-danger',
  info: 'ui-badge-info',
  // Status-specific
  requested: 'ui-badge-warning',
  accepted: 'ui-badge-info',
  canceled: 'ui-badge-danger',
  expired: 'ui-badge-default',
  fulfilled: 'ui-badge-success',
  checkin_pending: 'ui-badge-warning',
  in_progress: 'ui-badge-info',
  completed: 'ui-badge-success',
  online: 'ui-badge-success',
  offline: 'ui-badge-default',
  busy: 'ui-badge-warning',
};

export function Badge({
  children,
  variant = 'default',
  size = 'medium',
  className = '',
}) {
  const variantClass = BADGE_VARIANTS[variant] || BADGE_VARIANTS.default;

  return (
    <span className={`ui-badge ${variantClass} ui-badge-${size} ${className}`}>
      {children}
    </span>
  );
}

export default Badge;
