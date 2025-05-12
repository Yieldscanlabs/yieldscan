import React from 'react';
import styles from './TermsPage.module.css'; // Reuse the same styles

const PrivacyPage: React.FC = () => {
  return (
    <div className={styles.termsPage}>
      <h1>Privacy Policy</h1>
      <div className={styles.effectiveDate}>Effective Date: June 1, 2023</div>
      
      <p className={styles.intro}>
        This Privacy Policy describes how YieldScan ("we", "our", or "us") collects, uses, 
        and shares information in connection with your use of our websites, applications, and 
        other online services (collectively, the "Services").
      </p>
      
      <section className={styles.section}>
        <h2>1. Information We Collect</h2>
        <p>
          1.1. <span className={styles.highlight}>Wallet Information:</span> When you connect your wallet to our Services, 
          we collect your public wallet address. We do not collect your private keys or seed phrases.
        </p>
        <p>
          1.2. <span className={styles.highlight}>Usage Information:</span> We collect information about how you use our Services, 
          including the types of content you view or engage with, the features you use, and the actions you take.
        </p>
        <p>
          1.3. <span className={styles.highlight}>Technical Information:</span> We collect information about your device and 
          internet connection, including your browser type, operating system, and IP address.
        </p>
      </section>
      
      <section className={styles.section}>
        <h2>2. How We Use Your Information</h2>
        <p>
          2.1. <span className={styles.highlight}>Provide and Improve Services:</span> We use your information to provide, 
          personalize, maintain, and improve our Services.
        </p>
        <p>
          2.2. <span className={styles.highlight}>Analytical Purposes:</span> We use your information to better understand 
          how users access and use our Services, for analytics purposes, to evaluate and improve our Services.
        </p>
        <p>
          2.3. <span className={styles.highlight}>Security and Protection:</span> We use your information to protect our 
          Services and users, and to detect, prevent, and address fraud, security risks, and technical issues.
        </p>
      </section>
      
      {/* Additional sections removed for brevity */}
      
      <section className={styles.section}>
        <h2>7. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at:</p>
        <p className={styles.contactInfo}>📧 privacy@yieldscan.io</p>
        <p className={styles.contactInfo}>🌐 www.yieldscan.io/privacy</p>
      </section>
    </div>
  );
};

export default PrivacyPage;