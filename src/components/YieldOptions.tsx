import React from 'react';
import type { YieldOption } from '../types';
import { CHAIN_NAMES } from '../utils/constants';
import { getChainColor } from '../utils/helpers';

interface YieldOptionsProps {
  options: YieldOption[];
  loading: boolean;
  onSelectOption: (option: YieldOption) => void;
  selectedOption: YieldOption | null;
}

const YieldOptions: React.FC<YieldOptionsProps> = ({
  options,
  loading,
  onSelectOption,
  selectedOption
}) => {
  if (loading) {
    return <div className="loading">Loading yield options...</div>;
  }
  
  if (options.length === 0) {
    return <div className="no-options">No yield options available for this asset</div>;
  }
  
  return (
    <div className="yield-options">
      <h2>Yield Options</h2>
      <div className="options-list">
        {options.map((option) => (
          <div 
            key={option.id}
            className={`option-card ${selectedOption?.id === option.id ? 'selected' : ''}`}
            onClick={() => onSelectOption(option)}
          >
            <div className="option-header">
              <h3>{option.protocol}</h3>
              <div 
                className="chain-badge" 
                style={{ backgroundColor: getChainColor(option.chain) }}
              >
                {CHAIN_NAMES[option.chain]}
              </div>
            </div>
            <div className="option-details">
              <div className="option-apy">
                <span className="label">APY:</span>
                <span className="value">{option.apy}%</span>
              </div>
              <div className="option-tvl">
                <span className="label">TVL:</span>
                <span className="value">{option.tvl}</span>
              </div>
              <div className="option-risk">
                <span className="label">Risk:</span>
                <span className={`risk-badge risk-${option.risk.toLowerCase()}`}>
                  {option.risk}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default YieldOptions;