import React, { useRef, useState, useEffect } from 'react';
import './ui.css';

export function CodeInput({
  length = 6,
  value = '',
  onChange,
  disabled = false,
  error = '',
  autoFocus = true,
}) {
  const [code, setCode] = useState(value.split(''));
  const inputsRef = useRef([]);

  useEffect(() => {
    if (autoFocus && inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    setCode(value.split('').slice(0, length));
  }, [value, length]);

  const handleChange = (index, e) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!val) return;

    const newCode = [...code];
    newCode[index] = val.charAt(val.length - 1);
    setCode(newCode);
    onChange?.(newCode.join(''));

    // Auto-advance to next input
    if (val && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newCode = [...code];
      if (code[index]) {
        newCode[index] = '';
        setCode(newCode);
        onChange?.(newCode.join(''));
      } else if (index > 0) {
        newCode[index - 1] = '';
        setCode(newCode);
        onChange?.(newCode.join(''));
        inputsRef.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, length);
    const newCode = pasted.split('');
    while (newCode.length < length) newCode.push('');
    setCode(newCode);
    onChange?.(newCode.join(''));
    inputsRef.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div className="ui-code-input-container">
      <div className="ui-code-input-boxes">
        {Array.from({ length }, (_, i) => (
          <input
            key={i}
            ref={(el) => (inputsRef.current[i] = el)}
            type="text"
            inputMode="text"
            autoComplete="off"
            maxLength={1}
            value={code[i] || ''}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            disabled={disabled}
            className={`ui-code-input-box ${error ? 'ui-code-error' : ''}`}
          />
        ))}
      </div>
      {error && <span className="ui-error-text">{error}</span>}
    </div>
  );
}

export default CodeInput;
