import { useState, forwardRef } from 'react';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  showKeybind?: boolean;
}

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(({ 
  placeholder = "Search...", 
  value = "", 
  onChange, 
  className = "",
  disabled = false,
  showKeybind = false
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const clearSearch = () => {
    onChange("");
  };

  return (
    <div className={`${styles.searchContainer} ${className} ${isFocused ? styles.focused : ''} ${disabled ? styles.disabled : ''}`}>
      <div className={styles.searchIcon}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      
      <input
        ref={ref}
        type="text"
        className={styles.searchInput}
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
      />
      
      {showKeybind && !value && !isFocused && !disabled && (
        <div className={styles.keybindHint}>
          <kbd className={styles.kbd}>/</kbd>
        </div>
      )}
      
      {value && !disabled && (
        <button
          className={styles.clearButton}
          onClick={clearSearch}
          type="button"
          aria-label="Clear search"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar; 