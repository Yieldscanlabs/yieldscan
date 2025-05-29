// Helper function to get the explorer URL for a given chain
export const getExplorerUrl = (chainId: number, address: string): string => {
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
export const copyToClipboard = async (text: string): Promise<boolean> => {
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