import { useState, useRef, useEffect } from 'react';
import { useAddressAutocomplete } from '../hooks';

/**
 * Address input with autocomplete dropdown
 * @param {Object} props
 * @param {string} props.value - Current address text
 * @param {Function} props.onChange - Called when text changes
 * @param {Function} props.onSelect - Called when suggestion selected (lat, lng, label)
 * @param {string} props.placeholder - Input placeholder
 * @param {string} props.dotColor - Color of the dot indicator (e.g., '#22c55e')
 * @param {string} props.label - Input label text
 * @param {boolean} props.loading - External loading state (e.g., geolocation)
 * @param {string} props.className - Additional class names
 */
export function AddressInput({
  value = '',
  onChange,
  onSelect,
  placeholder = 'Digite um endereço...',
  dotColor = '#6366f1',
  label,
  loading: externalLoading = false,
  className = '',
}) {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const { suggestions, loading: searchLoading, search, clear } = useAddressAutocomplete({
    debounceMs: 300,
    minChars: 3,
    limit: 5,
  });

  const isLoading = externalLoading || searchLoading;

  // Sync external value changes only if user is not actively typing
  useEffect(() => {
    if (!isUserTyping && value) {
      setInputValue(value);
    }
  }, [value, isUserTyping]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsUserTyping(false);
        clear();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [clear]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsUserTyping(true);
    onChange?.(newValue);
    search(newValue);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleSelect = (suggestion) => {
    setInputValue(suggestion.label);
    setIsOpen(false);
    setIsUserTyping(false);
    clear();
    onSelect?.(suggestion.lat, suggestion.lng, suggestion.label);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'ArrowDown' && suggestions.length > 0) {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSelect(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        clear();
        break;
    }
  };

  const handleFocus = () => {
    if (inputValue.length >= 3 && suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div className={`address-input-container ${className}`} ref={containerRef}>
      {label && (
        <label className="address-input-label">
          <span className="address-dot" style={{ color: dotColor }}>●</span>
          {label}
        </label>
      )}
      
      <div className="address-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="address-input-field"
          autoComplete="off"
        />
        
        {isLoading && (
          <div className="address-input-spinner">
            <span className="spinner-icon">⟳</span>
          </div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul className="address-suggestions-dropdown">
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.id}
              className={`address-suggestion-item ${index === highlightedIndex ? 'highlighted' : ''}`}
              onClick={() => handleSelect(suggestion)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <span className="suggestion-icon">📍</span>
              <span className="suggestion-text">{suggestion.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AddressInput;
