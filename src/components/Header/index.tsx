import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useAssetStore } from '../../store/assetStore';
import { useApyStore } from '../../store/apyStore';
import type { ProtocolApys } from '../../store/apyStore';
import DesktopHeader from './components/DesktopHeader';
import MobileMenu from './components/MobileMenu';
import { getExplorerUrl, copyToClipboard } from './utils';

interface HeaderProps {
  isConnected: boolean;
  address?: string;
  disconnectWallet: () => void;
}

const Header: React.FC<HeaderProps> = ({
  isConnected,
  address,
  disconnectWallet
}) => {
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
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
      const balanceValue = parseFloat(asset.currentBalanceInProtocolUsd || '0');
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
  const [, setApy] = useState(calculateWeightedApy());

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
    const ticksPerYear = (365 * 24 * 60 * 60 * 1000) / 100; // Number of 100ms ticks in a year

    const timer = setInterval(() => {
      setTotalValue(prevValue => {
        // Calculate growth for this tick
        const growthRate = Math.pow(1 + (weightedApy / 100), 1 / ticksPerYear);

        // Use high precision multiplication to ensure decimal changes are visible
        const newValue = prevValue * growthRate;

        return newValue;
      });
    }, 100);

    // Cleanup timer on unmount
    return () => clearInterval(timer);
  }, [isConnected, totalHoldings, assets, apyData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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
    <>
      <DesktopHeader
        isVisible={isVisible}
        isConnected={isConnected}
        address={address}
        location={location}
        totalValue={totalValue}
        formatValue={formatValue}
        isDropdownOpen={isDropdownOpen}
        toggleDropdown={toggleDropdown}
        toggleMobileMenu={toggleMobileMenu}
        isMobileMenuOpen={isMobileMenuOpen}
        dropdownRef={dropdownRef}
        copySuccess={copySuccess}
        handleCopyAddress={handleCopyAddress}
        handleOpenExplorer={handleOpenExplorer}
        disconnectWallet={disconnectWallet}
      />

      <MobileMenu
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
        mobileMenuRef={mobileMenuRef}
        isConnected={isConnected}
        location={location}
        totalValue={totalValue}
        formatValue={formatValue}
      />
    </>
  );
};

export default Header; 