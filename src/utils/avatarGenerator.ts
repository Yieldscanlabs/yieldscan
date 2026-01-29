// src/utils/avatarGenerator.ts
export const generateWalletGradient = (address: string) => {
  // Simple hash function to get a number from address
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = address.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate 2 colors from the hash
  const c1 = (hash & 0x00ffffff).toString(16).toUpperCase();
  const c2 = ((hash >> 8) & 0x00ffffff).toString(16).toUpperCase();
  
  const color1 = "#" + "00000".substring(0, 6 - c1.length) + c1;
  const color2 = "#" + "00000".substring(0, 6 - c2.length) + c2;

  return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
};