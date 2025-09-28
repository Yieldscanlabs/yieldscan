import React from 'react';
import styles from './AlertsPage.module.css';
import useWalletConnection from '../hooks/useWalletConnection';
import WalletModal from '../components/WalletModal';
import SendMessageModal from '../components/SendMessageModal';
import axios from 'axios';

const AlertsPage: React.FC = () => {
  const { wallet, isModalOpen, openConnectModal, closeConnectModal } = useWalletConnection();

  const handleJoinBot = () => {
    window.open('https://t.me/yieldscan_bot', '_blank');
  };

  const [isSendModalOpen, setSendModalOpen] = React.useState(false);

  const handleSendMessageClick = () => {
    setSendModalOpen(true);
  };

  const handleCloseSendModal = () => {
    setSendModalOpen(false);
  };

  const handleSend = async (message: string) => {
    try {
      await axios.post('/api/broadcast', { message }); // your backend API
      alert('Message sent successfully!');
    } catch (err) {
      console.error('Failed to send message:', err);
      alert('Failed to send message');
    }
  };
  return (
    <div className={styles.container}>
      <div className={styles.hero}>

        {/* Left Content */}
        <div className={styles.heroLeft}>
          <h1 className={styles.heroTitle}>
            <span className={styles.highlight}>Money-Making Alerts</span>, Every Time
          </h1>

          <p className={styles.heroDescription}>
            Get instant Telegram notifications when better APY opportunities become available
            or when security risks are detected in your DeFi protocols.
          </p>

          <div className={styles.features}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>🎯</div>
              <div className={styles.featureContent}>
                <h3 className={styles.featureTitle}>APY Optimization</h3>
                <p className={styles.featureDesc}>Automatic detection of better yield opportunities across protocols. Get notified instantly when higher APY rates become available for your assets.</p>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>🔐</div>
              <div className={styles.featureContent}>
                <h3 className={styles.featureTitle}>Security Monitoring</h3>
                <p className={styles.featureDesc}>Real-time protocol security and risk alerts. Stay informed about audit results, security incidents, and potential risks to your investments.</p>
              </div>
            </div>
          </div>

          <div className={styles.ctaSection}>
            {wallet.isConnected ? (
              <>
                <button className={styles.ctaButton} onClick={handleJoinBot}>
                  I Want To Earn More
                  <span className={styles.ctaArrow}>→</span>
                </button>
              </>
            ) : (
              <>
                <button className={styles.ctaButton} onClick={openConnectModal}>
                  Connect Wallet
                  <span className={styles.ctaArrow}>→</span>
                </button>
                <p className={styles.ctaNote}>Connect your wallet to access alerts</p>
              </>
            )}
          </div>
        </div>

        {/* Right Visual */}
        <div className={styles.heroRight}>
          <div className={styles.visualContainer}>
            <div className={styles.phoneFrame}>
              <div className={styles.phoneScreen}>
                <div className={styles.notificationCard}>
                  <div className={styles.notifHeader}>
                    <div className={styles.botAvatar}>🤖</div>
                    <div className={styles.notifInfo}>
                      <div className={styles.notifTitle}>YieldScan Bot</div>
                      <div className={styles.notifTime}>now</div>
                    </div>
                  </div>
                  <div className={styles.notifContent}>
                    <div className={styles.alertBadge}>🎯 APY Alert</div>
                    <div className={styles.notifText}>
                      Better yield found! Move from Compound (4.2% APY) to Aave (6.8% APY)
                      for +2.6% improvement
                    </div>
                  </div>
                </div>

                <div className={styles.notificationCard}>
                  <div className={styles.notifHeader}>
                    <div className={styles.botAvatar}>🤖</div>
                    <div className={styles.notifInfo}>
                      <div className={styles.notifTitle}>YieldScan Bot</div>
                      <div className={styles.notifTime}>2m ago</div>
                    </div>
                  </div>
                  <div className={styles.notifContent}>
                    <div className={styles.alertBadge}>🔐 Security Alert</div>
                    <div className={styles.notifText}>
                      Protocol audit completed for Curve Finance. All clear - no issues found.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
      {wallet.isConnected && (
        <button onClick={handleSendMessageClick}>
          Send Message
        </button>
      )}
      {/* Wallet Modal */}
      <WalletModal
        isOpen={isModalOpen}
        onClose={closeConnectModal}
      />
      <SendMessageModal
        isOpen={isSendModalOpen}
        onClose={handleCloseSendModal}
        onSend={handleSend}
      />

    </div>
  );
};

export default AlertsPage; 