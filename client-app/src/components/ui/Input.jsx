import React, { useState } from 'react';
import './ui.css';

export function Input({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className={`ui-input-group ${error ? 'ui-input-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={name} className="ui-label">
          {label}
          {required && <span className="ui-required">*</span>}
        </label>
      )}
      <div className="ui-input-wrapper">
        <input
          type={isPassword && showPassword ? 'text' : type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="ui-input"
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="ui-password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        )}
      </div>
      {error && <span className="ui-error-text">{error}</span>}
    </div>
  );
}

export default Input;
