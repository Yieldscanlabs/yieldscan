import React, { useState, useRef } from 'react';
import styles from './TermsAndConditions.module.css';

interface TermsAndConditionsProps {
  onAccept: () => void;
  onClose: () => void;
}

const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({ onAccept, onClose }) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);
  const termsRef = useRef<HTMLDivElement>(null);
  
  const handleScroll = () => {
    if (termsRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = termsRef.current;
      // Consider "scrolled to bottom" when user has scrolled to at least 90% of the content
      if (scrollTop + clientHeight >= scrollHeight * 0.9) {
        setHasScrolledToBottom(true);
      }
    }
  };
console.log(hasAccepted)
  const handleAccept = () => {
    setHasAccepted(true);
    onAccept();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Terms and Conditions</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.content} ref={termsRef} onScroll={handleScroll}>
          <div className={styles.effectiveDate}>Effective Date: June 1, 2023</div>
          
          <p className={styles.intro}>
            These Terms and Conditions ("Terms") constitute a legally binding agreement between you ("User", "you", or "your") 
            and Yieldscan ("Company", "we", "our", or "us") regarding your access and use of the Yieldscan platform, 
            including our website, APIs, web applications, mobile services, browser extensions, and other related services 
            (collectively, the "Services").
          </p>
          
          <p>
            By accessing or using the Services, you agree that you have read, understood, and accept these Terms. 
            If you do not agree, do not access or use the Services.
          </p>
          
          <section className={styles.section}>
            <h3>1. Eligibility and Compliance</h3>
            <p>1.1. You must be at least 18 years old and have the legal capacity to enter into these Terms.</p>
            <p>
              1.2. You represent that you are not located in, under the control of, or a national or resident of any country 
              or territory subject to United States or other sovereign sanctions or embargoes.
            </p>
            <p>
              1.3. You are solely responsible for ensuring that your use of the Services complies with all applicable laws, 
              regulations, and third-party agreements.
            </p>
          </section>
          
          <section className={styles.section}>
            <h3>2. Nature of the Services</h3>
            <p>
              2.1. <span className={styles.highlight}>Informational Only:</span> Yieldscan is a non-custodial yield data aggregator. 
              We provide access to publicly available blockchain data and protocol metrics to help users discover and compare 
              yield opportunities in decentralized finance ("DeFi").
            </p>
            <p>
              2.2. <span className={styles.highlight}>No Custody or Asset Management:</span> Yieldscan does not hold or manage user assets. 
              You retain full control of your funds through your self-custodial wallets.
            </p>
            <p>
              2.3. <span className={styles.highlight}>No Financial Advice or Offerings:</span> Nothing on the Platform constitutes financial, 
              investment, tax, or legal advice. We do not offer or facilitate the purchase or sale of securities, 
              derivatives, or any financial instruments.
            </p>
            <p>
              2.4. <span className={styles.highlight}>Third-Party Protocols:</span> Yieldscan indexes data from third-party DeFi protocols 
              (e.g., Aave, Compound, Morpho, Pendle). We do not operate or audit these protocols, and are not responsible 
              for any interactions you undertake with them.
            </p>
          </section>
          
          <section className={styles.section}>
            <h3>3. Risk Disclosure</h3>
            <p>
              3.1. <span className={styles.highlight}>Use at Your Own Risk:</span> Interacting with DeFi protocols involves significant risks including, but not 
              limited to, smart contract bugs, oracle failures, loss of peg in stablecoins, protocol insolvency, rug pulls, 
              and extreme volatility. You acknowledge that you assume full responsibility for any and all losses that may arise 
              from using such protocols.
            </p>
            <p>
              3.2. <span className={styles.highlight}>No Guarantees:</span> Yield estimates, token performance, and APYs displayed on Yieldscan are subject to 
              change and are not guaranteed. We do not guarantee uptime, accuracy, or completeness of any data presented.
            </p>
            <p>
              3.3. <span className={styles.highlight}>Tax and Regulatory Responsibility:</span> You are solely responsible for any tax reporting and compliance 
              required in your jurisdiction in connection with any DeFi activity.
            </p>
          </section>
          
          <section className={styles.section}>
            <h3>4. Prohibited Uses</h3>
            <p>You agree not to use the Services to:</p>
            <ul>
              <li>Violate any applicable law or regulation.</li>
              <li>Commit fraud, money laundering, terrorist financing, or other illicit financial activity.</li>
              <li>Attempt to reverse engineer, decompile, scrape, or otherwise misuse the Services or associated smart contracts.</li>
              <li>Interfere with or disrupt the integrity or performance of the Platform.</li>
              <li>Infringe upon our intellectual property or the rights of any third party.</li>
            </ul>
            <p>
              We reserve the right to report illegal activity to law enforcement and block or restrict access accordingly.
            </p>
          </section>
          
          <section className={styles.section}>
            <h3>5. Account and Wallet Use</h3>
            <p>
              5.1. <span className={styles.highlight}>No Account Required:</span> We do not require you to create an account to use the Platform. 
              However, you may connect a Web3 wallet (e.g., MetaMask) for transactional purposes.
            </p>
            <p>
              5.2. <span className={styles.highlight}>Wallets Are User-Controlled:</span> We do not control your private keys. 
              You are solely responsible for managing your wallet and ensuring its security.
            </p>
          </section>
          
          <section className={styles.section}>
            <h3>6. Intellectual Property</h3>
            <p>
              6.1. All content on Yieldscan, including logos, designs, text, code, analytics, and other proprietary information, 
              is owned by or licensed to us and is protected by copyright, trademark, and other laws.
            </p>
            <p>
              6.2. You may not copy, modify, distribute, perform, display, sublicense, or reverse-engineer any part of the 
              Services without our prior written consent.
            </p>
          </section>
          
          <section className={styles.section}>
            <h3>7. Token and Protocol Listings</h3>
            <p>
              7.1. <span className={styles.highlight}>No Endorsement:</span> The appearance of any token, yield opportunity, or DeFi protocol on 
              Yieldscan is not an endorsement or recommendation.
            </p>
            <p>
              7.2. <span className={styles.highlight}>Third-Party Logos:</span> All third-party trademarks, logos, and names are the property of their 
              respective owners. Their appearance on Yieldscan is for informational purposes only.
            </p>
          </section>
          
          <section className={styles.section}>
            <h3>8. Data and Analytics</h3>
            <p>
              8.1. We may collect and store anonymized usage data to improve the Services. 
              Our collection and use of data is governed by our Privacy Policy.
            </p>
            <p>
              8.2. Yieldscan may display analytics, rankings, and comparative metrics. These are generated using algorithmic 
              models and are not verified, guaranteed, or exhaustive.
            </p>
          </section>
          
          <section className={styles.section}>
            <h3>9. Limitation of Liability</h3>
            <p>To the maximum extent permitted by law:</p>
            <ul>
              <li>
                We are not liable for any direct, indirect, incidental, special, consequential, or punitive damages 
                resulting from your use of the Services.
              </li>
              <li>
                We disclaim all warranties, express or implied, including but not limited to merchantability, 
                fitness for a particular purpose, and non-infringement.
              </li>
              <li>
                You use Yieldscan "as is" and "as available".
              </li>
            </ul>
          </section>
          
          <section className={styles.section}>
            <h3>10. Indemnification</h3>
            <p>
              You agree to indemnify and hold harmless Yieldscan, its officers, directors, affiliates, and employees from any 
              and all claims, liabilities, damages, losses, or expenses (including attorneys' fees) arising out of your use of 
              the Services, your violation of these Terms, or your violation of any third-party rights.
            </p>
          </section>
          
          <section className={styles.section}>
            <h3>11. Termination</h3>
            <p>
              We may suspend or terminate your access to Yieldscan at any time and without notice if we believe you have 
              violated these Terms or engaged in unlawful activity.
            </p>
          </section>
          
          <section className={styles.section}>
            <h3>12. Amendments</h3>
            <p>
              We may update or revise these Terms at any time by posting the revised version on the Platform. Your continued use 
              of the Services after such changes constitutes acceptance of the revised Terms.
            </p>
          </section>
          
          <section className={styles.section}>
            <h3>13. Dispute Resolution</h3>
            <p>
              13.1. <span className={styles.highlight}>Governing Law:</span> These Terms shall be governed by the laws of Cayman Islands.
            </p>
            <p>
              13.2. <span className={styles.highlight}>Arbitration Clause:</span> Any dispute, controversy, or claim arising out of or relating to 
              these Terms shall be settled by binding arbitration in accordance with the rules of International Chamber of Commerce, 
              with the seat of arbitration in Grand Cayman.
            </p>
          </section>
          
          <section className={styles.section}>
            <h3>14. Contact Us</h3>
            <p>For any inquiries related to these Terms or the Services, contact us at:</p>
            <p>📧 legal@yieldscan.io</p>
            <p>🌐 www.yieldscan.io</p>
          </section>
        </div>
        
        <div className={styles.footer}>
          <div className={styles.scrollNotice} style={{ opacity: hasScrolledToBottom ? 0 : 1 }}>
            Please scroll to the bottom to accept the terms
          </div>
          <div className={styles.actions}>
            <button 
              className={styles.declineButton} 
              onClick={onClose}
            >
              Decline
            </button>
            <button 
              className={styles.acceptButton} 
              onClick={handleAccept}
              disabled={!hasScrolledToBottom}
            >
              Accept & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;