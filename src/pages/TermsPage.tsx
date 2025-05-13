import React from 'react';
import styles from './TermsPage.module.css';

const TermsPage: React.FC = () => {
  return (
    <div className={styles.termsPage}>
      <h1>Yieldscan Terms and Conditions</h1>
      <div className={styles.effectiveDate}>Effective Date: May 13, 2025</div>
      
      <p className={styles.intro}>
        These Terms and Conditions ("Terms") govern your use of the Yieldscan platform ("Yieldscan," "we," "us," or "our"), 
        including access to our website, smart contracts, and any associated services. By accessing or using Yieldscan, 
        you agree to be bound by these Terms. If you do not agree, do not use Yieldscan.
      </p>
      
      <hr className={styles.divider} />
      
      <section className={styles.section}>
        <h2>1. Eligibility</h2>
        <p>
          You must be at least 18 years old or the age of majority in your jurisdiction to use Yieldscan. 
          By using the platform, you represent and warrant that you meet these requirements.
        </p>
      </section>
      
      <section className={styles.section}>
        <h2>2. User Responsibilities</h2>
        <ul>
          <li><span className={styles.highlight}>Self-Custody:</span> All actions on Yieldscan are user-initiated. There are no oracles, validators, or background automation.</li>
          <li><span className={styles.highlight}>Wallet Access:</span> You are solely responsible for the security of your wallet and private keys. Yieldscan does not have access to or custody over your assets.</li>
          <li><span className={styles.highlight}>Risk Assumption:</span> You acknowledge that DeFi investments carry risk, including potential loss of principal, protocol failure, and smart contract bugs. You accept full responsibility for all actions and outcomes.</li>
        </ul>
      </section>
      
      <section className={styles.section}>
        <h2>3. Platform Functionality</h2>
        <ul>
          <li><span className={styles.highlight}>Yield Aggregation:</span> Yieldscan identifies and displays yield opportunities across integrated DeFi protocols. Users can deploy capital using their own dedicated smart contracts ("YieldBox").</li>
          <li><span className={styles.highlight}>Strategy Execution:</span> Users choose strategies and initiate transactions. Yieldscan does not execute any actions without user approval.</li>
          <li><span className={styles.highlight}>AI Monitoring:</span> Risk alerts are generated using AI analysis of on-chain and off-chain data. These alerts are informational and not financial advice.</li>
        </ul>
      </section>
      
      <section className={styles.section}>
        <h2>4. Fees</h2>
        <ul>
          <li><span className={styles.highlight}>Performance Fees:</span> Fees are charged only on earned yield at the time of withdrawal. The current fee is 10% of generated yield.</li>
          <li><span className={styles.highlight}>Transparency:</span> All fees are clearly shown before deposit and at withdrawal. No hidden fees or automated charges.</li>
        </ul>
      </section>
      
      <section className={styles.section}>
        <h2>5. Vaults and Security</h2>
        <ul>
          <li><span className={styles.highlight}>Isolated Vaults:</span> Each user receives a unique smart contract vault to isolate funds and prevent asset mingling.</li>
          <li><span className={styles.highlight}>Third-Party Protocols:</span> Yieldscan only integrates with audited, high TVL DeFi protocols. However, we do not control these protocols and cannot guarantee their performance.</li>
          <li><span className={styles.highlight}>Smart Contract Risks:</span> While Yieldscan follows best practices in smart contract development, all contracts carry inherent risk. Use at your own risk.</li>
        </ul>
      </section>
      
      <section className={styles.section}>
        <h2>6. Disclaimers</h2>
        <ul>
          <li><span className={styles.highlight}>No Financial Advice:</span> Yieldscan does not provide investment advice. All information is for educational and informational purposes only.</li>
          <li><span className={styles.highlight}>No Guarantees:</span> We do not guarantee returns, uptime, or the accuracy of AI-generated alerts.</li>
          <li><span className={styles.highlight}>Third-Party Services:</span> Yieldscan is not responsible for external links, third-party services, or integrated DeFi protocols.</li>
        </ul>
      </section>
      
      <section className={styles.section}>
        <h2>7. Privacy</h2>
        <p>
          Yieldscan respects your privacy. We do not collect personal data unless voluntarily provided 
          (e.g., for receiving alerts via WhatsApp or Telegram). See our <a href="/privacy">Privacy Policy</a> for more details.
        </p>
      </section>
      
      <section className={styles.section}>
        <h2>8. Prohibited Uses</h2>
        <p>You agree not to use Yieldscan for:</p>
        <ul>
          <li>Engaging in illegal or fraudulent activities</li>
          <li>Circumventing access controls or attempting to exploit vulnerabilities</li>
          <li>Interfering with the functionality or integrity of the platform</li>
        </ul>
      </section>
      
      <section className={styles.section}>
        <h2>9. Modification and Termination</h2>
        <p>
          We reserve the right to modify or terminate the platform or these Terms at any time. 
          Continued use constitutes acceptance of any modifications.
        </p>
      </section>
      
      <section className={styles.section}>
        <h2>10. Governing Law</h2>
        <p>
          These Terms are governed by the laws of the State of Delaware. Any disputes shall be resolved 
          in the competent courts of that jurisdiction.
        </p>
      </section>
      
      <section className={styles.section}>
        <h2>11. Contact</h2>
        <p>For support or questions, contact:</p>
        <p className={styles.contactInfo}>📧 support@yieldscan.io</p>
        <p className={styles.contactInfo}>🌐 t.me/yieldscan_support</p>
      </section>
      
      <hr className={styles.divider} />
      
      <p className={styles.closing}>
        By using Yieldscan, you affirm that you have read, understood, and agreed to these Terms and Conditions.
      </p>
    </div>
  );
};

export default TermsPage;