import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';
import Logo from './Logo';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <Logo/>
          <p className={styles.footerDescription}>
            Find the best yield opportunities for your assets across multiple chains and protocols.
          </p>
          <div className={styles.socialLinks}>
            <a href="https://github.com/yieldscanlabs" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
              </svg>
            </a>
            {/* <a href="https://twitter.com/yieldscan" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 9.99 9.99 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a> */}
            <a href="https://t.me/Yieldscanio" target="_blank" rel="noopener noreferrer" aria-label="Discord">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-1.968 9.296c-.146.658-.537.818-1.084.51l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.054 5.56-5.022c.242-.213-.054-.334-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.658-.643.136-.953l11.59-4.471c.538-.196 1.006.128.81.934z" />
                </svg>
            </a>
          </div>
        </div>
        
        <div className={styles.footerSection}>
          <h4>Product</h4>
          <ul className={styles.footerLinks}>
            <li><a href="/about">About</a></li>
            <li><a href="/calculator">Calculator</a></li>
            <li><a href="/faq">FAQ</a></li>
          </ul>
        </div>
        
        {/* <div className={styles.footerSection}>
          <h4>Resources</h4>
          <ul className={styles.footerLinks}>
            <li><a href="/guides">User Guides</a></li>
            <li><a href="/security">Security</a></li>
            <li><a href="/supported-assets">Supported Assets</a></li>
          </ul>
        </div> */}
        
        {/* <div className={styles.footerSection}>
          <h4>Company</h4>
          <ul className={styles.footerLinks}>
            <li><a href="/about">About</a></li>
            <li><a href="/team">Team</a></li>
            <li><a href="/careers">Careers</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div> */}
        
        <div className={styles.footerSection}>
            <h4>Policies</h4>
          <ul className={styles.footerLinks}>
            <li><Link to="/terms">Terms of Service</Link></li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>
      
      <div className={styles.footerBottom}>
        <p>&copy; {currentYear} Yieldscan. All rights reserved.</p>
        <p className={styles.disclaimerText}>
          Yieldscan is a DeFi yield aggregator that helps users find the best yield opportunities.
          Yieldscan does not control, operate and secure any of the protocols it provides access to.
        </p>
        <p className={styles.buildInfo}>v0.1.0-beta | Built with 💜</p>
      </div>
    </footer>
  );
};

export default Footer;