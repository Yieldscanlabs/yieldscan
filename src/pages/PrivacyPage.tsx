import React from 'react';
import styles from './TermsPage.module.css'; // Reuse the same styles

const PrivacyPage: React.FC = () => {
  return (
    <div className={styles.termsPage}>
      <h1>Privacy Policy</h1>
      <div className={styles.effectiveDate}>Effective Date: May 12, 2025</div>
      
      <p className={styles.intro}>
        This Privacy Policy describes how Yieldscan ("we", "our", or "us") collects, uses, 
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
        <p>
          1.4. <span className={styles.highlight}>Contact Information (Optional):</span> If you opt-in to alerts, 
          we collect your phone number or messaging app ID (e.g., Telegram, WhatsApp).
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
        <p>
          2.4. <span className={styles.highlight}>Notifications:</span> To send AI-generated alerts and notifications 
          (if you have opted-in to receive them).
        </p>
      </section>

      <section className={styles.section}>
        <h2>3. Data Storage and Security</h2>
        <p>
          3.1. <span className={styles.highlight}>On-Chain Data:</span> Wallet and transaction data are stored on-chain; 
          we do not hold custody or sensitive keys.
        </p>
        <p>
          3.2. <span className={styles.highlight}>Off-Chain Data:</span> Contact information is stored securely using 
          industry-standard encryption.
        </p>
        <p>
          3.3. <span className={styles.highlight}>Access Controls:</span> Access to user data is strictly limited to 
          authorized personnel for platform operations only.
        </p>
      </section>

      <section className={styles.section}>
        <h2>4. Sharing of Information</h2>
        <p>
          4.1. <span className={styles.highlight}>No Sale of Data:</span> We do not sell, rent, or trade your personal information.
        </p>
        <p>
          4.2. <span className={styles.highlight}>Service Providers:</span> We may share limited data with trusted service 
          providers strictly for delivering alert notifications.
        </p>
        <p>
          4.3. <span className={styles.highlight}>Legal Compliance:</span> We may disclose data if required by law, 
          regulation, or legal process.
        </p>
      </section>

      <section className={styles.section}>
        <h2>5. Cookies and Tracking</h2>
        <p>
          We use minimal cookies only for essential site functions and anonymized analytics. No third-party ad tracking is used.
        </p>
      </section>

      <section className={styles.section}>
        <h2>6. Your Choices</h2>
        <p>
          6.1. <span className={styles.highlight}>Optional Information:</span> You can choose not to provide optional contact information.
        </p>
        <p>
          6.2. <span className={styles.highlight}>Opt-Out Options:</span> You may opt out of alerts or request deletion of 
          your contact data at any time by contacting us.
        </p>
      </section>

      <section className={styles.section}>
        <h2>7. Data Retention</h2>
        <p>
          We retain contact data only as long as necessary to provide alert services or as legally required.
        </p>
      </section>

      <section className={styles.section}>
        <h2>8. Children's Privacy</h2>
        <p>
          Yieldscan is not intended for individuals under the age of 18. We do not knowingly collect 
          personal data from minors.
        </p>
      </section>

      <section className={styles.section}>
        <h2>9. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Material changes will be posted with an 
          updated effective date.
        </p>
      </section>
      
      <section className={styles.section}>
        <h2>10. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at:</p>
        <p className={styles.contactInfo}>📧 privacy@yieldscan.io</p>
        <p className={styles.contactInfo}>🌐 www.yieldscan.io/privacy</p>
      </section>

      <div className={styles.footer}>
        By using Yieldscan, you consent to the practices outlined in this Privacy Policy.
      </div>
    </div>
  );
};

export default PrivacyPage;