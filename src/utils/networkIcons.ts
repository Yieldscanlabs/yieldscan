import ethereumIcon from '../assets/networks/ethereum.svg';
import arbitrumIcon from '../assets/networks/arbitrum.svg';
// import polygonIcon from '../assets/networks/polygon.svg';
// import bscIcon from '../assets/networks/bsc.svg';
// import optimismIcon from '../assets/networks/optimism.svg';

/**
 * Returns the appropriate network icon based on chain ID
 * @param chainId The blockchain network ID
 * @returns The network icon image source
 */
export function getNetworkIcon(chainId: number): string {
  switch (chainId) {
    case 1:
      return ethereumIcon;
    case 42161:
      return arbitrumIcon;
    // case 137:
    //   return polygonIcon;
    // case 56:
    //   return bscIcon;
    case 10:
      return optimismIcon;
    default:
      // Return a generic blockchain icon for unknown chains
      return ethereumIcon; // Could be replaced with a generic blockchain icon
  }
}

/**
 * Returns the network color based on chain ID
 * @param chainId The blockchain network ID
 * @returns The color hex code associated with the network
 */
export function getNetworkColor(chainId: number): string {
  switch (chainId) {
    case 1:
      return '#627EEA'; // Ethereum blue
    case 42161:
      return '#28A0F0'; // Arbitrum blue
    case 137:
      return '#8247E5'; // Polygon purple
    case 56:
      return '#F3BA2F'; // BSC yellow
    case 10:
      return '#FF0420'; // Optimism red
    default:
      return '#718096'; // Generic gray
  }
}

/**
 * Returns the network name based on chain ID
 * @param chainId The blockchain network ID
 * @returns The human-readable network name
 */
export function getNetworkName(chainId: number): string {
  switch (chainId) {
    case 1:
      return 'Ethereum';
    case 42161:
      return 'Arbitrum';
    case 137:
      return 'Polygon';
    case 56:
      return 'BSC';
    case 10:
      return 'Optimism';
    default:
      return `Chain ${chainId}`;
  }
}

/**
 * Creates a data URL for a network icon using a letter and the network's color
 * This is useful as a fallback when SVG images aren't available
 * @param chainId The blockchain network ID
 * @returns A data URL for the network icon
 */
export function getNetworkIconDataUrl(chainId: number): string {
  const name = getNetworkName(chainId);
  const letter = name.charAt(0);
  const color = getNetworkColor(chainId);
  
  // Create a canvas element
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  // Draw a circular background
  ctx.beginPath();
  ctx.arc(16, 16, 16, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
  
  // Draw the letter
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(letter, 16, 16);
  
  // Convert to data URL
  return canvas.toDataURL('image/png');
}