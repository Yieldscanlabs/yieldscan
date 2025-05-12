import React from 'react';
import styles from './TermsPage.module.css';

const TermsPage: React.FC = () => {
  return (
    <div className={styles.termsPage}>
      <h1>Terms and Conditions</h1>
      <div className={styles.effectiveDate}>Effective Date: May  12, 2025</div>
      
      <p className={styles.intro}>
        These Terms and Conditions ("Terms") constitute a legally binding agreement between you ("User", "you", or "your") 
        and YieldScan ("Company", "we", "our", or "us") regarding your access and use of the YieldScan platform, 
        including our website, APIs, web applications, mobile services, browser extensions, and other related services 
        (collectively, the "Services").
      </p>
      
      <p>
        By accessing or using the Services, you agree that you have read, understood, and accept these Terms. 
        If you do not agree, do not access or use the Services.
      </p>
      
      <section className={styles.section}>
        <h2>1. Eligibility and Compliance</h2>
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
        <h2>2. Nature of the Services</h2>
        <p>
          2.1. <span className={styles.highlight}>Informational Only:</span> YieldScan is a non-custodial yield data aggregator. 
          We provide access to publicly available blockchain data and protocol metrics to help users discover and compare 
          yield opportunities in decentralized finance ("DeFi").
        </p>
        <p>
          2.2. <span className={styles.highlight}>No Custody or Asset Management:</span> YieldScan does not hold or manage user assets. 
          You retain full control of your funds through your self-custodial wallets.
        </p>
        <p>
          2.3. <span className={styles.highlight}>No Financial Advice or Offerings:</span> Nothing on the Platform constitutes financial, 
          investment, tax, or legal advice. We do not offer or facilitate the purchase or sale of securities, 
          derivatives, or any financial instruments.
        </p>
        <p>
          2.4. <span className={styles.highlight}>Third-Party Protocols:</span> YieldScan indexes data from third-party DeFi protocols 
          (e.g., Aave, Compound, Morpho, Pendle). We do not operate or audit these protocols, and are not responsible 
          for any interactions you undertake with them.
        </p>
      </section>
      
      <section className={styles.section}>
        <h2>3. Risk Disclosure</h2>
        <p>
          3.1. <span className={styles.highlight}>Use at Your Own Risk:</span> Interacting with DeFi protocols involves significant risks including, but not 
          limited to, smart contract bugs, oracle failures, loss of peg in stablecoins, protocol insolvency, rug pulls, 
          and extreme volatility. You acknowledge that you assume full responsibility for any and all losses that may arise 
          from using such protocols.
        </p>
        <p>
          3.2. <span className={styles.highlight}>No Guarantees:</span> Yield estimates, token performance, and APYs displayed on YieldScan are subject to 
          change and are not guaranteed. We do not guarantee uptime, accuracy, or completeness of any data presented.
        </p>
        <p>
          3.3. <span className={styles.highlight}>Tax and Regulatory Responsibility:</span> You are solely responsible for any tax reporting and compliance 
          required in your jurisdiction in connection with any DeFi activity.
        </p>
      </section>
      
      <section className={styles.section}>
        <h2>4. Prohibited Uses</h2>
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
        <h2>5. Account and Wallet Use</h2>
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
        <h2>6. Intellectual Property</h2>
        <p>
          6.1. All content on YieldScan, including logos, designs, text, code, analytics, and other proprietary information, 
          is owned by or licensed to us and is protected by copyright, trademark, and other laws.
        </p>
        <p>
          6.2. You may not copy, modify, distribute, perform, display, sublicense, or reverse-engineer any part of the 
          Services without our prior written consent.
        </p>
      </section>
      
      {/* Additional sections removed for brevity */}
      
      <section className={styles.section}>
        <h2>14. Contact Us</h2>
        <p>For any inquiries related to these Terms or the Services, contact us at:</p>
        <p className={styles.contactInfo}>📧 legal@yieldscan.io</p>
        <p className={styles.contactInfo}>🌐 www.yieldscan.io</p>
      </section>
    </div>
  );
};

export default TermsPage;