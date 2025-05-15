import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './CalculatorPage.module.css';

const CalculatorPage: React.FC = () => {
  const [amount, setAmount] = useState('1000');
  const [apy, setApy] = useState('5');
  const [compound, setCompound] = useState('daily');
  const [investmentPeriod, setInvestmentPeriod] = useState('1');
  const [yields, setYields] = useState({
    daily: '0', weekly: '0', monthly: '0', yearly: '0',
    compounded: '0', totalValue: '0'
  });

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD',
      minimumFractionDigits: 2, maximumFractionDigits: 2
    }).format(value);
  };

  const apyPresets = [
    { label: 'Stablecoins', value: '4' },
    { label: 'ETH Staking', value: '5.5' },
    { label: 'LP', value: '10' },
    { label: 'Farming', value: '25' }
  ];

  const amountPresets = [
    { label: '$500', value: '500' },
    { label: '$1K', value: '1000' },
    { label: '$5K', value: '5000' },
    { label: '$10K', value: '10000' }
  ];

  useEffect(() => {
    const amountNum = parseFloat(amount);
    const apyNum = parseFloat(apy);
    const periodYears = parseFloat(investmentPeriod);
    
    if (!isNaN(amountNum) && !isNaN(apyNum) && !isNaN(periodYears)) {
      const apyDecimal = apyNum / 100;
      const dailyYield = (amountNum * apyDecimal) / 365;
      const weeklyYield = dailyYield * 7;
      const monthlyYield = dailyYield * 30.42;
      const yearlyYield = dailyYield * 365;
      
      let totalValue = 0;
      
      if (compound === 'daily') {
        totalValue = amountNum * Math.pow(1 + (apyDecimal / 365), 365 * periodYears);
      } else if (compound === 'weekly') {
        totalValue = amountNum * Math.pow(1 + (apyDecimal / 52), 52 * periodYears);
      } else if (compound === 'monthly') {
        totalValue = amountNum * Math.pow(1 + (apyDecimal / 12), 12 * periodYears);
      } else {
        totalValue = amountNum * (1 + apyDecimal * periodYears);
      }
      
      const compoundedYield = totalValue - amountNum;
      
      setYields({
        daily: formatCurrency(dailyYield),
        weekly: formatCurrency(weeklyYield),
        monthly: formatCurrency(monthlyYield),
        yearly: formatCurrency(yearlyYield),
        compounded: formatCurrency(compoundedYield),
        totalValue: formatCurrency(totalValue)
      });
    }
  }, [amount, apy, compound, investmentPeriod]);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.calculatorContainer}>
        
        <div className={styles.twoColumnLayout}>
          <div className={styles.inputColumn}>
            <div className={styles.inputWrapper}>
              <label htmlFor="amount">Initial Investment</label>
              <div className={styles.inputWithPrefix}>
                <span className={styles.inputPrefix}>$</span>
                <input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  step="100"
                />
              </div>
              <div className={styles.presetButtons}>
                {amountPresets.map(preset => (
                  <button 
                    key={preset.value}
                    type="button"
                    className={amount === preset.value ? styles.presetActive : ''}
                    onClick={() => setAmount(preset.value)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className={styles.inputWrapper}>
              <label htmlFor="apy">APY</label>
              <div className={styles.inputWithSuffix}>
                <input
                  id="apy"
                  type="number"
                  value={apy}
                  onChange={(e) => setApy(e.target.value)}
                  min="0"
                  max="1000"
                  step="0.1"
                />
                <span className={styles.inputSuffix}>%</span>
              </div>
              <div className={styles.presetButtons}>
                {apyPresets.map(preset => (
                  <button 
                    key={preset.value}
                    className={apy === preset.value ? styles.presetActive : ''}
                    onClick={() => setApy(preset.value)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className={styles.inputRow}>
              <div className={styles.inputHalf}>
                <label htmlFor="compound">Compounding</label>
                <select
                  id="compound"
                  value={compound}
                  onChange={(e) => setCompound(e.target.value)}
                  className={styles.select}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              
              <div className={styles.inputHalf}>
                <label htmlFor="period">Period (Years)</label>
                <div className={styles.inputWithSuffix}>
                  <input
                    id="period"
                    type="number"
                    value={investmentPeriod}
                    onChange={(e) => setInvestmentPeriod(e.target.value)}
                    min="0.1"
                    max="30"
                    step="0.1"
                  />
                  <span className={styles.inputSuffix}>yr</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles.resultsColumn}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                <h3>Summary</h3>
              </div>
              <div className={styles.summaryContent}>
                <div className={styles.comparisonLayout}>
                  <div className={styles.comparisonItem}>
                    <div className={styles.comparisonValue}>{formatCurrency(parseFloat(amount) || 0)}</div>
                    <div className={styles.comparisonLabel}>Initial</div>
                  </div>
                  <div className={styles.comparisonArrow}>→</div>
                  <div className={styles.comparisonItem}>
                    <div className={styles.comparisonValue}>{yields.totalValue}</div>
                    <div className={styles.comparisonLabel}>Final ({investmentPeriod} {parseFloat(investmentPeriod) === 1 ? 'yr' : 'yrs'})</div>
                  </div>
                </div>
                <div className={styles.interestAmount}>
                  <div className={styles.interestValue}>{yields.compounded}</div>
                  <div className={styles.interestLabel}>Interest Earned</div>
                </div>
              </div>
            </div>
            
            <div className={styles.resultMini}>
              <div className={styles.resultGrid}>
                <div className={styles.resultCard}>
                  <div className={styles.resultValue}>{yields.daily}</div>
                  <div className={styles.resultLabel}>Daily</div>
                </div>
                <div className={styles.resultCard}>
                  <div className={styles.resultValue}>{yields.weekly}</div>
                  <div className={styles.resultLabel}>Weekly</div>
                </div>
                <div className={styles.resultCard}>
                  <div className={styles.resultValue}>{yields.monthly}</div>
                  <div className={styles.resultLabel}>Monthly</div>
                </div>
                <div className={styles.resultCard}>
                  <div className={styles.resultValue}>{yields.yearly}</div>
                  <div className={styles.resultLabel}>Yearly</div>
                </div>
              </div>
            </div>
            
            <div className={styles.disclaimerMini}>
              Estimates only. Actual yields may vary based on protocol performance.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculatorPage;