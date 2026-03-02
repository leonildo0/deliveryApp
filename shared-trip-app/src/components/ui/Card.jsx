import React from 'react';
import './ui.css';

export function Card({
  children,
  title,
  subtitle,
  footer,
  variant = 'default',
  padding = 'medium',
  className = '',
}) {
  return (
    <div className={`ui-card ui-card-${variant} ui-card-p-${padding} ${className}`}>
      {(title || subtitle) && (
        <div className="ui-card-header">
          {title && <h3 className="ui-card-title">{title}</h3>}
          {subtitle && <p className="ui-card-subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="ui-card-body">{children}</div>
      {footer && <div className="ui-card-footer">{footer}</div>}
    </div>
  );
}

export default Card;
