import React, { useState } from 'react';
import { SOFT_MIN_USD } from '../../hooks/useLowValueFilter';

interface LowValueFilterCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string; // Optional: Default is "Hide low values"
  title?: string; // Optional: Tooltip text
  style?: React.CSSProperties; // Optional: Extra styles
}

const LowValueFilterCheckbox: React.FC<LowValueFilterCheckboxProps> = ({
  checked,
  onChange,
  label = `Hide (< ${SOFT_MIN_USD.toFixed(2)} USD)`,
  title = "Hide assets with balance ≤ $1.00",
  style
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Combine base styles with hover logic
  const containerStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    color: isHovered ? 'var(--primary-color)' : 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
    userSelect: 'none',
    ...style, 
  };

  const inputStyle: React.CSSProperties = {
    cursor: 'pointer',
    accentColor: 'var(--primary-color)'
  };

  return (
    <label
      style={containerStyle}
      title={title}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={inputStyle}
      />
      {label}
    </label>
  );
};

export default LowValueFilterCheckbox;