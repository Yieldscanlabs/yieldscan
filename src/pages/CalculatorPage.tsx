import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './CalculatorPage.module.css';

const CalculatorPage: React.FC = () => {
  const [amount, setAmount] = useState('1000');
  const [apy, setApy] = useState('5');
  const [compound, setCompound] = useState('daily');
  const [yields, setYields] = useState({
    daily: '0',
    weekly: '0',
    monthly: '0',
    yearly: '0',
    compounded: '0'
  });

  // Format number to USD
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Calculate yields based on inputs
  useEffect(() => {
    const amountNum = parseFloat(amount);
    const apyNum = parseFloat(apy);
    
    if (!isNaN(amountNum) && !isNaN(apyNum)) {
      // Simple interest calculations
      const apyDecimal = apyNum / 100;
      const dailyYield = (amountNum * apyDecimal) / 365;
      const weeklyYield = dailyYield * 7;
      const monthlyYield = dailyYield * 30.42; // Average days in a month
      const yearlyYield = dailyYield * 365;
      
      // Compound interest calculation
      let compoundedYield = 0;
      
      if (compound === 'daily') {
        compoundedYield = amountNum * Math.pow(1 + (apyDecimal / 365), 365) - amountNum;
      } else if (compound === 'weekly') {
        compoundedYield = amountNum * Math.pow(1 + (apyDecimal / 52), 52) - amountNum;
      } else if (compound === 'monthly') {
        compoundedYield = amountNum * Math.pow(1 + (apyDecimal / 12), 12) - amountNum;
      } else {
        compoundedYield = amountNum * apyDecimal;
      }
      
      setYields({
        daily: formatCurrency(dailyYield),
        weekly: formatCurrency(weeklyYield),
        monthly: formatCurrency(monthlyYield),
        yearly: formatCurrency(yearlyYield),
        compounded: formatCurrency(compoundedYield)
      });
    }
  }, [amount, apy, compound]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const handleApyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApy(e.target.value);
  };

  const handleCompoundChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCompound(e.target.value);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.navigation}>
        <Link to="/" className={styles.backLink}>
          &larr; Back to Dashboard
        </Link>
      </div>
      
      <div className={styles.calculatorContainer}>
        <div className={styles.calculatorHeader}>
          <h1>Yield Calculator</h1>
          <p className={styles.subheader}>Calculate potential earnings based on APY</p>
        </div>
        
        <div className={styles.calculatorForm}>
          <div className={styles.inputGroup}>
            <label htmlFor="amount">Initial Investment</label>
            <div className={styles.inputWithPrefix}>
              <span className={styles.inputPrefix}>$</span>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={handleAmountChange}
                placeholder="Enter amount"
                min="0"
                step="100"
              />
            </div>
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="apy">Annual Percentage Yield (APY)</label>
            <div className={styles.inputWithSuffix}>
              <input
                id="apy"
                type="number"
                value={apy}
                onChange={handleApyChange}
                placeholder="Enter APY"
                min="0"
                max="1000"
                step="0.1"
              />
              <span className={styles.inputSuffix}>%</span>
            </div>
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="compound">Compounding Frequency</label>
            <select
              id="compound"
              value={compound}
              onChange={handleCompoundChange}
              className={styles.select}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly (Simple)</option>
            </select>
          </div>
        </div>
        
        <div className={styles.resultSection}>
          <h2>Potential Earnings</h2>
          
          <div className={styles.resultsGrid}>
            <div className={styles.resultCard}>
              <h3>Daily</h3>
              <div className={styles.resultValue}>{yields.daily}</div>
              <div className={styles.resultDescription}>Average daily income</div>
            </div>
            
            <div className={styles.resultCard}>
              <h3>Weekly</h3>
              <div className={styles.resultValue}>{yields.weekly}</div>
              <div className={styles.resultDescription}>Average weekly income</div>
            </div>
            
            <div className={styles.resultCard}>
              <h3>Monthly</h3>
              <div className={styles.resultValue}>{yields.monthly}</div>
              <div className={styles.resultDescription}>Average monthly income</div>
            </div>
            
            <div className={styles.resultCard}>
              <h3>Yearly</h3>
              <div className={styles.resultValue}>{yields.yearly}</div>
              <div className={styles.resultDescription}>Simple annual yield</div>
            </div>
          </div>
          
          <div className={styles.compoundedSection}>
            <div className={styles.compoundedCard}>
              <h3>Annual Yield with {compound.charAt(0).toUpperCase() + compound.slice(1)} Compounding</h3>
              <div className={styles.compoundedValue}>{yields.compounded}</div>
              <div className={styles.compoundedTotal}>
                Total after 1 year: {formatCurrency(parseFloat(amount) + parseFloat(yields.compounded.replace(/[$,]/g, '')))}
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.disclaimerSection}>
          <p className={styles.disclaimer}>
            Note: These calculations are estimates only. Actual yields may vary based on protocol performance, 
            market conditions, and compounding frequency. APYs in DeFi can fluctuate significantly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CalculatorPage;