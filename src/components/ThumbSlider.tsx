import React, { useState, useEffect } from 'react';
import styles from './ThumbSlider.module.css';
import type { QuickPercentage, ThumbSliderProps } from './ThumbSlider.types';

const defaultQuickPercentages: QuickPercentage[] = [
  { value: 25, label: '25%' },
  { value: 50, label: '50%' },
  { value: 75, label: '75%' },
  { value: 100, label: 'Max' }
];

const ThumbSlider: React.FC<ThumbSliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  showPercentage = true,
  showQuickButtons = true,
  quickPercentages = defaultQuickPercentages,
  badge,
  className = '',
  disabled = false,
}) => {
  const [activeQuickValue, setActiveQuickValue] = useState<number | null>(null);

  const percentage = ((value - min) / (max - min)) * 100;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const newValue = parseFloat(e.target.value);
    onChange(newValue);
    setActiveQuickValue(null);
  };

  const handleQuickPercentage = (percent: number) => {
    if (disabled) return;
    
    const newValue = min + ((max - min) * percent / 100);
    onChange(newValue);
    setActiveQuickValue(percent);
  };

  // Reset active quick value when value changes externally
  useEffect(() => {
    const currentPercentage = ((value - min) / (max - min)) * 100;
    const matchingQuick = quickPercentages.find(q => Math.abs(q.value - currentPercentage) < 0.1);
    setActiveQuickValue(matchingQuick ? matchingQuick.value : null);
  }, [value, min, max, quickPercentages]);

  return (
    <div className={`${styles['slider-container']} ${className} ${disabled ? styles.disabled : ''}`}>
      {badge && (
        <div className={styles['slider-badge']}>
          {badge}
        </div>
      )}
      
      <div className={styles['slider-track']}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          className={styles['slider-input']}
          disabled={disabled}
        />
        <div 
          className={styles['slider-progress']} 
          style={{ width: `${percentage}%` }}
        />
        <div 
          className={styles['slider-thumb']}
          style={{ left: `${percentage}%` }}
        >
          {showPercentage && (
            <span className={styles['slider-percentage']}>
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      </div>
      
      {showQuickButtons && quickPercentages.length > 0 && (
        <div className={styles['quick-buttons']}>
          {quickPercentages.map((quick) => (
            <button 
              key={quick.value}
              onClick={() => handleQuickPercentage(quick.value)}
              className={`${styles['quick-button']} ${
                activeQuickValue === quick.value ? styles.active : ''
              }`}
              disabled={disabled}
            >
              {quick.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThumbSlider; 