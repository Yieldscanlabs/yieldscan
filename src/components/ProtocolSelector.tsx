import React, { useState, useRef, useEffect } from 'react';
import styles from './ProtocolSelector.module.css'; // Create a new CSS module for the dropdown
import Protocol from './Protocol'; // Import your Protocol component for icons

interface ProtocolSelectorProps {
  selectedProtocol: string | 'all';
  protocols: string[];
  onChange: (protocol: string | 'all') => void;
  className?: string;
}

const ProtocolSelector: React.FC<ProtocolSelectorProps> = ({ 
  selectedProtocol, 
  protocols, 
  onChange, 
  className 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (protocol: string | 'all') => {
    onChange(protocol);
    setIsOpen(false);
  };

  const displayValue = selectedProtocol === 'all' ? 'All Protocols' : selectedProtocol;

  return (
    <div className={`${styles.dropdown} ${className || ''}`} ref={dropdownRef}>
      <button 
        className={styles.dropdownToggle}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {selectedProtocol !== 'all' && (
          <span className={styles.protocolIcon}>
            <Protocol name={selectedProtocol} showName={false} size="small" />
          </span>
        )}
        <span>{displayValue}</span>
        <span className={styles.arrow}>▼</span>
      </button>
      
      {isOpen && (
        <div className={styles.dropdownMenu}>
          <div 
            className={`${styles.dropdownItem} ${selectedProtocol === 'all' ? styles.selected : ''}`}
            onClick={() => handleSelect('all')}
          >
            All Protocols
          </div>
          
          {protocols.map((protocol) => (
            <div
              key={protocol}
              className={`${styles.dropdownItem} ${selectedProtocol === protocol ? styles.selected : ''}`}
              onClick={() => handleSelect(protocol)}
            >
              <span className={styles.protocolIcon}>
                <Protocol name={protocol} showName={false} size="small" />
              </span>
              <span>{protocol}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProtocolSelector;