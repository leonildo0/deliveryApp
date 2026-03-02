import React from 'react';
import './ui.css';

export function Spinner({ size = 'medium', color = 'primary', className = '' }) {
  return (
    <div className={`ui-spinner ui-spinner-${size} ui-spinner-${color} ${className}`}>
      <div className="ui-spinner-ring"></div>
    </div>
  );
}

export function LoadingScreen({ message = 'Carregando...' }) {
  return (
    <div className="ui-loading-screen">
      <Spinner size="large" />
      <p className="ui-loading-message">{message}</p>
    </div>
  );
}

export function Skeleton({ width, height, variant = 'text', className = '' }) {
  const style = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? '1em' : undefined),
  };

  return (
    <div 
      className={`ui-skeleton ui-skeleton-${variant} ${className}`}
      style={style}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="ui-skeleton-card">
      <Skeleton variant="rect" height="20px" width="40%" />
      <Skeleton variant="text" />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="60%" />
    </div>
  );
}

export default Spinner;
