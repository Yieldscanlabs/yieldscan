import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { shortenAddress } from '../utils/helpers';
import styles from './Header.module.css';
import Logo from './Logo';
import { useAssetStore } from '../store/assetStore';
import { useApyStore } from '../store/apyStore';
import type { ProtocolApys } from '../store/apyStore';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  isConnected: boolean;
  address?: string;
  disconnectWallet: () => void;
}

// Helper function to get the explorer URL for a given chain
const getExplorerUrl = (chainId: number, address: string): string => {
  const explorers: Record<number, string> = {
    1: 'https://etherscan.io',
    56: 'https://bscscan.com',
    42161: 'https://arbiscan.io',
    137: 'https://polygonscan.com',
    8453: 'https://basescan.org',
    10: 'https://optimistic.etherscan.io',
  };
  
  const baseUrl = explorers[chainId] || 'https://etherscan.io';
  return `${baseUrl}/address/${address}`;
};

// Helper function to copy text to clipboard
const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (fallbackErr) {
      console.error('Failed to copy text: ', fallbackErr);
      return false;
    }
  }
};

const Header: React.FC<HeaderProps> = ({ 
  isConnected, 
  address, 
  disconnectWallet 
}) => {
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { assets } = useAssetStore();
  const { apyData } = useApyStore();
  const { chainId } = useAccount();
  
  // Scroll state for header visibility
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  // Calculate total yield-bearing holdings (with fallback to 0)
  const totalHoldings = assets
    .filter(asset => asset.yieldBearingToken)
    .reduce((sum, asset) => {
      const balanceValue = parseFloat(asset.balanceUsd || '0');
      return isNaN(balanceValue) ? sum : sum + balanceValue;
    }, 0);

  // Calculate weighted average APY across all yield-bearing assets
  const calculateWeightedApy = () => {
    let totalWeightedApy = 0;
    let totalValue = 0;
    
    assets.filter(asset => asset.yieldBearingToken).forEach(asset => {
      const balanceValue = parseFloat(asset.balanceUsd || '0');
      if (isNaN(balanceValue) || balanceValue === 0) return;
      
      // Get APY for this asset from apyStore if available
      let assetApy = 0;
      if (asset.protocol && apyData[asset.chainId]?.[asset.address.toLowerCase()]) {
        const apys = apyData[asset.chainId][asset.address.toLowerCase()] as ProtocolApys;
        assetApy = apys[asset.protocol.toLowerCase() as keyof ProtocolApys] || 0;
      }
      
      // If no APY found, use a default of 3%
      if (assetApy === 0) assetApy = 3;
      
      totalWeightedApy += assetApy * balanceValue;
      totalValue += balanceValue;
    });
    
    // Return weighted average APY (default to 4% if no yield-bearing assets)
    return totalValue > 0 ? (totalWeightedApy / totalValue) : 4;
  };
  
  // Use state for the live value
  const [totalValue, setTotalValue] = useState(totalHoldings || 1000);
  const [apy, setApy] = useState(calculateWeightedApy());
  // Format value with proper comma separators and 18 decimal places
  const formatValue = (value: number): string => {
    // Ensure the value is a valid number
    if (typeof value !== 'number' || isNaN(value)) {
      return '1000.000000000000000000';
    }
    
    try {
      if (value >= 1000) {
        return value.toLocaleString('en-US', { minimumFractionDigits: 18, maximumFractionDigits: 18 });
      } else {
        return value.toFixed(18);
      }
    } catch (error) {
      console.error('Error formatting value:', error);
      return '1000.000000000000000000';
    }
  };

  // Handle scroll events for header visibility
  useEffect(() => {
    const controlHeader = () => {
      const currentScrollY = window.scrollY;
      
      // Determine if should show or hide based on scroll direction
      if (currentScrollY < lastScrollY) {
        // Scrolling up
        setIsVisible(true);
      } else if (currentScrollY > 50 && currentScrollY > lastScrollY) {
        // Scrolling down and not at the top
        setIsVisible(false);
      }
      
      // Update last scroll position
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', controlHeader);
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', controlHeader);
    };
  }, [lastScrollY]);

  // Live ticker effect - update total value every 100ms for more visible decimal changes
  useEffect(() => {
    if (!isConnected) return;
    
    // Set initial values based on current holdings and APY
    const initialValue = totalHoldings > 0 ? totalHoldings : 1000;
    const weightedApy = calculateWeightedApy();
    
    setTotalValue(initialValue);
    setApy(weightedApy);
    
    
    // Calculate the per-tick growth rate based on APY
    // Formula: value * (1 + APY/100)^(tick/ticks_per_year) - value
    const ticksPerYear = (365 * 24 * 60 * 60 * 1000) / 100; // Number of 100ms ticks in a year
    
    const timer = setInterval(() => {
      setTotalValue(prevValue => {
        // Calculate growth for this tick
        const growthRate = Math.pow(1 + (weightedApy / 100), 1 / ticksPerYear);
        
        // Use high precision multiplication to ensure decimal changes are visible
        const newValue = prevValue * growthRate;
        
        // Log occasionally to verify growth in the decimal places
        if (Math.random() < 0.01) {
       
        }
        
        return newValue;
      });
    }, 100); // Update more frequently (100ms) to see changes in smaller decimal places
    
    // Cleanup timer on unmount
    return () => clearInterval(timer);
  }, [isConnected, totalHoldings, assets, apyData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset copy success message after 2 seconds
  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => setCopySuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleCopyAddress = async () => {
    if (address) {
      const success = await copyToClipboard(address);
      if (success) {
        setCopySuccess(true);
      }
    }
  };

  const handleOpenExplorer = () => {
    if (address && chainId) {
      const explorerUrl = getExplorerUrl(chainId, address);
      window.open(explorerUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <header className={`${styles.header} ${isVisible ? styles.headerVisible : styles.headerHidden}`}>
      <div className={styles.headerLeft}>
        <Link to="/" className={styles.titleLink}>
          <Logo />
        </Link>
        
        {/* Navigation Links */}
        <nav className={styles.navigation}>
          {/* Always show Home */}
          <Link 
            to="/" 
            className={`${styles.navLink} ${location.pathname === '/' ? styles.activeLink : ''}`}
          >
            Wallet
          </Link>
          
          {/* Only show My Yields when connected */}
          {isConnected && (
            <Link 
              to="/yields" 
              className={`${styles.navLink} ${location.pathname === '/yields' ? styles.activeLink : ''}`}
            >
              My Yields
            </Link>
          )}
          <Link 
            to="/explore" 
            className={`${styles.navLink} ${location.pathname === '/explore' ? styles.activeLink : ''}`}
          >
            Explore
          </Link>
          <Link 
            to="/alerts" 
            className={`${styles.navLink} ${location.pathname === '/alerts' ? styles.activeLink : ''}`}
          >
            Alerts
          </Link>
        </nav>
      </div>
      
      <div className={styles.headerRight}>
        {/* Display total value if connected */}
        {isConnected && (
          <div className={styles.earningsContainer}>
            <div className={styles.earningsBadgeTotal}>
              <span className={styles.earningsLabel}>Total Savings:</span>
              <span className={styles.earningsAmount}>
                ~${formatValue(totalValue)}
              </span>
            </div>
          </div>
        )}
        
        {/* Wallet address and dropdown */}
        {isConnected && address && (
          <div className={styles.walletContainer} ref={dropdownRef}>
            <div 
              className={`${styles.walletAddress} ${isDropdownOpen ? styles.walletAddressActive : ''}`}
              onClick={toggleDropdown}
            >
              {shortenAddress(address)}
              <span className={styles.dropdownArrow}>▼</span>
            </div>
            {isDropdownOpen && (
              <div className={styles.walletDropdown}>
                <button 
                  onClick={handleCopyAddress} 
                  className={styles.dropdownButton}
                >
                  {copySuccess ? 'Copied!' : 'Copy Address'}
                </button>
                
                <button 
                  onClick={handleOpenExplorer} 
                  className={styles.dropdownButton}
                >
                  View on Explorer
                </button>
                
                <div className={styles.dropdownDivider}></div>
                
                <div className={styles.dropdownThemeToggle}>
                  <ThemeToggle />
                </div>
                
                <div className={styles.dropdownDivider}></div>
                
                <button 
                  onClick={disconnectWallet} 
                  className={`${styles.dropdownButton} ${styles.disconnectButton}`}
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;