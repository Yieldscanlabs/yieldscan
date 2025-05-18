import React from 'react';
import { Link } from 'react-router-dom';
import styles from './AboutPage.module.css';

const AboutPage: React.FC = () => {
  return (
    <div className={styles.aboutContainer}>
      <div className={styles.aboutContent}>
        <header className={styles.aboutHeader}>
        </header>

        <section className={styles.aboutSection}>
          <h2>About</h2>
          <p>
            Yieldscan is a yield aggregation platform that empowers users to earn better returns by routing funds to top-performing DeFi protocols with no intermediaries. Every action is fully user-driven in a secure, trust-minimized environment.
          </p>
          <p>
            We make DeFi simple through one-click strategy optimization, AI risk monitoring, secure vaults, and transparent fees—putting full control in your hands without the complexity.
          </p>
        </section>

        <section className={styles.ctaSection}>
          <h2>Want to Learn More?</h2>
          <p>
            Dive deeper into our technical architecture, mathematical yield models, security measures, 
            and overall vision in our comprehensive Litepaper.
          </p>
          <Link to="/litepaper" className={styles.litepaperButton}>
            Read the Litepaper
          </Link>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;