import React, { useState } from 'react';
import ThumbSlider from './ThumbSlider';

const ThumbSliderDemo: React.FC = () => {
  const [basicValue, setBasicValue] = useState(50);
  const [rangeValue, setRangeValue] = useState(75);
  const [amountValue, setAmountValue] = useState(1000);
  const [customValue, setCustomValue] = useState(30);

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>ThumbSlider Component Demo</h1>
      
      {/* Basic Usage */}
      <section style={{ marginBottom: '3rem' }}>
        <h2>Basic Percentage Slider</h2>
        <p>Value: {basicValue}%</p>
        <ThumbSlider
          value={basicValue}
          onChange={setBasicValue}
        />
      </section>

      {/* Custom Range */}
      <section style={{ marginBottom: '3rem' }}>
        <h2>Custom Range (0-200)</h2>
        <p>Value: {rangeValue}</p>
        <ThumbSlider
          value={rangeValue}
          onChange={setRangeValue}
          min={0}
          max={200}
        />
      </section>

      {/* Amount Slider with Badge */}
      <section style={{ marginBottom: '3rem' }}>
        <h2>Amount Slider with APY Badge</h2>
        <p>Amount: ${amountValue.toLocaleString()}</p>
        <ThumbSlider
          value={amountValue}
          onChange={setAmountValue}
          min={0}
          max={10000}
          step={100}
          showPercentage={false}
          badge={<span>5.25% APY</span>}
          quickPercentages={[
            { value: 25, label: '25%' },
            { value: 50, label: '50%' },
            { value: 75, label: '75%' },
            { value: 100, label: 'Max' }
          ]}
        />
      </section>

      {/* Custom Quick Buttons */}
      <section style={{ marginBottom: '3rem' }}>
        <h2>Custom Quick Buttons</h2>
        <p>Value: {customValue}</p>
        <ThumbSlider
          value={customValue}
          onChange={setCustomValue}
          quickPercentages={[
            { value: 10, label: 'Low' },
            { value: 40, label: 'Med' },
            { value: 80, label: 'High' },
            { value: 100, label: 'Full' }
          ]}
        />
      </section>

      {/* Minimal Version */}
      <section style={{ marginBottom: '3rem' }}>
        <h2>Minimal (No Quick Buttons)</h2>
        <p>Value: {Math.round(((customValue - 0) / (100 - 0)) * 100)}%</p>
        <ThumbSlider
          value={customValue}
          onChange={setCustomValue}
          showQuickButtons={false}
        />
      </section>

      {/* Disabled State */}
      <section style={{ marginBottom: '3rem' }}>
        <h2>Disabled State</h2>
        <ThumbSlider
          value={75}
          onChange={() => {}}
          disabled={true}
          badge={<span>Locked</span>}
        />
      </section>
    </div>
  );
};

export default ThumbSliderDemo; 