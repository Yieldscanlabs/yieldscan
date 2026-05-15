import metamask from "../assets/metamask.svg";
import phantom from "../assets/phantom.png";
import walletConnectSvg from "../assets/wallets/wallet-connect.svg";
import coinbaseSvg from "../assets/wallets/coinbase.svg";
import browserWalletSvg from "../assets/wallets/browser-wallet.svg";
import pontemSvg from "../assets/wallets/pontem.svg";
import trustWalletSvg from "../assets/wallets/trust-wallet.svg";
import rainbowSvg from "../assets/wallets/rainbow.svg";
import okxSvg from "../assets/wallets/okx.svg";
import safeSvg from "../assets/wallets/safe.svg";
import rabbySvg from "../assets/wallets/rabby.png";

export const MetaMaskIcon = () => (
  <img src={metamask} width={28} height={28} alt="MetaMask" />
);
export const PhantomWallet = () => (
  <img src={phantom} width={28} height={28} alt="Phantom" />
);
export const WalletConnectIcon = () => (
  <img src={walletConnectSvg} width={28} height={28} alt="WalletConnect" />
);
export const CoinbaseIcon = () => (
  <img src={coinbaseSvg} width={28} height={28} alt="Coinbase" />
);
export const BrowserWalletIcon = () => (
  <img src={browserWalletSvg} width={28} height={28} alt="Browser Wallet" />
);
export const PontemWalletIcon = () => (
  <img src={pontemSvg} width={28} height={28} alt="Pontem" />
);
export const TrustWalletIcon = () => (
  <img src={trustWalletSvg} width={28} height={28} alt="Trust Wallet" />
);
export const RainbowWalletIcon = () => (
  <img src={rainbowSvg} width={28} height={28} alt="Rainbow" />
);
export const OKXWalletIcon = () => (
  <img src={okxSvg} width={28} height={28} alt="OKX" />
);
export const SafeWalletIcon = () => (
  <img src={safeSvg} width={28} height={28} alt="Safe" />
);
export const RabbyWalletIcon = () => (
  <img src={rabbySvg} width={16} height={16} alt="Rabby" />
);

export function getWalletIcon(id: string) {
  switch (id) {
    case "io.metamask":
      return <MetaMaskIcon />;
    case "coinbaseWallet":
      return <CoinbaseIcon />;
    case "network.pontem":
      return <PontemWalletIcon />;
    case "app.phantom":
      return <PhantomWallet />;
    case "io.rabby":
    case "rabby":
      return <RabbyWalletIcon />;
    case "com.trustwallet.app":
    case "trustWallet":
      return <TrustWalletIcon />;
    case "me.rainbow":
    case "rainbow":
      return <RainbowWalletIcon />;
    case "com.okex.wallet":
    case "okx":
      return <OKXWalletIcon />;
    case "io.gnosis.safe":
    case "safe":
      return <SafeWalletIcon />;
    case "injected":
    default:
      return <BrowserWalletIcon />;
  }
}
