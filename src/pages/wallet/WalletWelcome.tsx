import { Link } from 'react-router-dom';
import Logo from '../../components/Logo';
import styles from './Wallet.module.css';

interface WalletWelcomeProps {
  onConnect: () => void;
}

function WalletWelcome({ onConnect }: WalletWelcomeProps) {
  return (
    <div className={styles.welcomeContainer}>
      <div className={styles.welcomeMessage}>
        <Logo
          slogan={true}
          className={styles.enalgeLogo}
        />
        <h2> </h2>

        <p>Find the best yield opportunities for your assets across multiple chains</p>

        <div className={styles.centerWalletConnect}>
          <button 
            onClick={onConnect}
            className={styles.connectButtonLarge}
          >
            Connect Wallet
          </button>
        </div>
        
        <div className={styles.exploreAsGuest}>
          <Link to="/explore" className={styles.exploreLink}>
            Explore as guest →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default WalletWelcome; 