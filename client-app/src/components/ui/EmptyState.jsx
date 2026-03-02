import React from 'react';
import './ui.css';

export function EmptyState({
  icon = '📭',
  title,
  message,
  action,
  actionLabel,
  className = '',
}) {
  return (
    <div className={`ui-empty-state ${className}`}>
      <span className="ui-empty-icon">{icon}</span>
      {title && <h3 className="ui-empty-title">{title}</h3>}
      {message && <p className="ui-empty-message">{message}</p>}
      {action && actionLabel && (
        <button className="ui-btn ui-btn-primary" onClick={action}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function ErrorState({
  title = 'Algo deu errado',
  message = 'Ocorreu um erro inesperado.',
  retry,
  retryLabel = 'Tentar novamente',
  className = '',
}) {
  return (
    <div className={`ui-error-state ${className}`}>
      <span className="ui-error-icon">❌</span>
      <h3 className="ui-error-title">{title}</h3>
      <p className="ui-error-message">{message}</p>
      {retry && (
        <button className="ui-btn ui-btn-primary" onClick={retry}>
          {retryLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
