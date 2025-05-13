import React, { useRef, useState, useEffect } from 'react';
import styles from './LitepaperPage.module.css';

const LitepaperPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({
    'exec-summary': null,
    'problem': null,
    'solution': null,
    'tech-architecture': null,
    'roadmap': null,
    'tokenomics': null,
    'conclusion': null
  });
  
  useEffect(() => {
    // Add event listener to handle scroll and update active section
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100; // Offset for header
      
      // Find the current section being viewed
      let currentActive = null;
      Object.entries(sectionRefs.current).forEach(([id, ref]) => {
        if (ref && ref.offsetTop <= scrollPosition && 
            ref.offsetTop + ref.offsetHeight > scrollPosition) {
          currentActive = id;
        }
      });
      
      setActiveSection(currentActive);
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const section = sectionRefs.current[sectionId];
    if (section) {
      window.scrollTo({
        top: section.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className={styles.litepaper}>
      <div className={styles.tableOfContents}>
        <h3>Contents</h3>
        <ul>
          <li 
            className={activeSection === 'exec-summary' ? styles.active : ''}
            onClick={() => scrollToSection('exec-summary')}
          >
            Executive Summary
          </li>
          <li 
            className={activeSection === 'problem' ? styles.active : ''}
            onClick={() => scrollToSection('problem')}
          >
            The Problem
          </li>
          <li 
            className={activeSection === 'solution' ? styles.active : ''}
            onClick={() => scrollToSection('solution')}
          >
            Our Solution
          </li>
          <li 
            className={activeSection === 'tech-architecture' ? styles.active : ''}
            onClick={() => scrollToSection('tech-architecture')}
          >
            Technical Architecture
          </li>
          <li 
            className={activeSection === 'conclusion' ? styles.active : ''}
            onClick={() => scrollToSection('conclusion')}
          >
            Conclusion
          </li>
        </ul>
      </div>

      <div className={styles.content}>
        <header className={styles.header}>
          <h1>Litepaper</h1>
          <div className={styles.version}>v1.0 - May 2025</div>
        </header>
        
        <section 
          id="exec-summary"
          ref={(el) => { sectionRefs.current['exec-summary'] = el; }}
          className={styles.section}
        >
          <div className={`${styles.stickyTitle} ${activeSection === 'exec-summary' ? styles.active : ''}`}>
            <h2>Executive Summary</h2>
          </div>
          
          <div className={styles.sectionContent}>
            <p>
              Yieldscan is a yield aggregation platform that empowers users to earn better returns on their crypto assets 
              by routing funds to top-performing DeFi protocols, no oracles, validators, or automation. Every action is 
              fully user-driven, ensuring a secure and trust-minimized environment.
            </p>
            <p>
              The platform make DeFi participation easy by offering:
            </p>
            <ul className={styles.bulletPoints}>
              <li>Real time strategies with one click optimization</li>
              <li>AI monitoring of liquidity and social sentiment for protocol health alerts</li>
              <li>Smart contract vaults that isolate user funds</li>
              <li>Transparent, yield based fees</li>
            </ul>
            <p>
              With security, simplicity, and transparency at its core, Yieldscan puts full control in the user's hands 
              while removing the complexity of managing yield across multiple protocols.
            </p>
          </div>
        </section>
        
        <section 
          id="problem" 
          ref={(el) => { sectionRefs.current['problem'] = el; }}
          className={styles.section}
        >
          <div className={`${styles.stickyTitle} ${activeSection === 'problem' ? styles.active : ''}`}>
            <h2>The Problem</h2>
          </div>
          
          <div className={styles.sectionContent}>
            <p>Earning yield remains inaccessible for most users. Here are some of the problems user encounter:</p>
            
            <ul className={styles.bulletPoints}>
              <li>
                <strong>Complicated User Experience:</strong> Going through different protocols, comparing yields, and deploying capital effectively requires technical skill and constant attention.
              </li>
              <li>
                <strong>Fragmented Ecosystem:</strong> Yield opportunities are spread across platforms, forcing users to juggle wallets, dashboards, and manual calculations to find the best returns.
              </li>
              <li>
                <strong>Management Burden:</strong> Veteran users constantly monitor and change positions. What needs to be passive income usually becomes a full time job.
              </li>
            </ul>
          </div>
        </section>
        
        <section 
          id="solution"
          ref={(el) => { sectionRefs.current['solution'] = el; }}
          className={styles.section}
        >
          <div className={`${styles.stickyTitle} ${activeSection === 'solution' ? styles.active : ''}`}>
            <h2>Our Solution: Yieldscan</h2>
          </div>
          
          <div className={styles.sectionContent}>
            <p>Yieldscan addresses the core challenges of DeFi participation through the following:</p>
            
            <ul className={styles.bulletPoints}>
              <li>
                <strong>Simple Strategy Execution:</strong> Users are shown the most profitable yield paths available, and with a single click Yieldscan handles all routing and execution.
              </li>
              <li>
                <strong>Separate User Vaults:</strong> Using gas optimized deployment, each deposit deploys a personal smart contract (YieldBox) to ensure asset isolation and risk containment.
              </li>
              <li>
                <strong>Transparent Fee Structure:</strong> Fees are only applied to earned yield. Clearly shown on deposit and withdrawal.
              </li>
              <li>
                <strong>User-Only Action Model:</strong> All operations are triggered solely by user actions. There are no oracles, no off-chain automation, and no third-party validators. This approach reduces the attack surface and ensures that users remain in full control of their assets and decisions at all times. Responsibility stays with the user.
              </li>
              <li>
                <strong>AI Monitoring:</strong> AI monitors on chain liquidity and social signals across supported protocols. Users are notified about potential risks or opportunities in real time.
              </li>
              <li>
                <strong>Easy Yield Optimization:</strong> Users are shown and notified about better strategies when they are available, Yieldscan allows them to migrate funds with a single click.
              </li>
            </ul>
          </div>
        </section>
        
        <section 
          id="tech-architecture"
          ref={(el) => { sectionRefs.current['tech-architecture'] = el; }}
          className={styles.section}
        >
          <div className={`${styles.stickyTitle} ${activeSection === 'tech-architecture' ? styles.active : ''}`}>
            <h2>Technical Architecture</h2>
          </div>
          
          <div className={styles.sectionContent}>
            <h3>Smart Contract Design</h3>
            <p>
              Each user is assigned a dedicated smart contract that handles their assets independently. 
              The core contract — <code>YieldBox</code> — performs the following:
            </p>
            
            <h4>Key Components</h4>
            <ul className={styles.bulletPoints}>
              <li>Deploys individual user vaults on deposit</li>
              <li>Routes assets to chosen protocols (e.g., Aave)</li>
              <li>Tracks performance and calculates earned yield</li>
              <li>Supports secure, on-demand withdrawals</li>
              <li>Calculates fees at withdrawal time only</li>
            </ul>
            
            <h3>Mathematical Yield Optimization Model</h3>
            
            <p>
              Yieldscan employs a simple yield calculation method that ensures fair value distribution:
            </p>
            
            <h4>Yield Calculation Formula</h4>
            
            <div className={styles.formula}>
              <div className={styles.formulaContent}>
                Y = [(T<sub>total</sub> - T<sub>initial</sub>) × (1 - F)] / T<sub>initial</sub>
              </div>
            </div>
            
            <p>Where:</p>
            <ul className={styles.formulaLegend}>
              <li><strong>Y</strong>: Net Yield</li>
              <li><strong>T<sub>total</sub></strong>: Total token balance after investment period</li>
              <li><strong>T<sub>initial</sub></strong>: Initial token investment</li>
              <li><strong>F</strong>: Platform fee percentage</li>
            </ul>
            
            <h4>Fee Distribution Model</h4>
            
            <p>Our fee calculation ensures platform sustainability while maximizing user returns:</p>
            
            <div className={styles.formula}>
              <div className={styles.formulaContent}>
                F<sub>user</sub> = (A<sub>withdrawn</sub> × Y × F<sub>percentage</sub>) / (T<sub>total</sub> × 100)
              </div>
            </div>
            
            <p>Where:</p>
            <ul className={styles.formulaLegend}>
              <li><strong>F<sub>user</sub></strong>: User-specific fee calculated at withdrawal time</li>
              <li><strong>A<sub>withdrawn</sub></strong>: Total amount being withdrawn by the user</li>
              <li><strong>Y</strong>: Net yield generated during the investment period</li>
              <li><strong>F<sub>percentage</sub></strong>: Platform's predetermined performance fee (currently 10%)</li>
            </ul>

            <h3>AI Monitoring</h3>
            <p>
              Yieldscan has built an AI monitoring system designed to constantly detect and alert about risks before they affect user capital. 
              Evaluating both on-chain and off-chain data to build a fluid risk profile for each supported protocol. 
              Users who subscribed are alerted on WhatsApp or Telegram in case of such an event.
            </p>
            
            <h4>On-Chain Monitoring</h4>
            <p>
              Using time-series prediction and anomaly detection models (such as LSTM, Isolation Forests), 
              Yieldscan constantly analyzes key metrics such as:
            </p>
            <ul className={styles.bulletPoints}>
              <li>Protocol liquidity trends</li>
              <li>TVL fluctuations</li>
              <li>Token flow irregularities</li>
              <li>Smart contract event anomalies</li>
            </ul>
            
            <h4>Off-Chain Sentiment Intelligence</h4>
            <p>
              To supplement on-chain data, Yieldscan applies fine-tuned NLP models ( FinBERT, RoBERTa) 
              to monitor social sentiment and governance activity across platforms like Twitter and Reddit. The AI flags:
            </p>
            <ul className={styles.bulletPoints}>
              <li>Negative sentiment spikes</li>
              <li>Controversial governance proposals</li>
              <li>Mentions of exploits or vulnerabilities</li>
            </ul>
            <p>
              By monitoring these events and unifying them into a structured, simple risk profile we can detect potential issues 
              like liquidity drains, depegs, or abnormal behavior in protocol operations and give our users a chance to be first to act, 
              allowing them to secure their capital.
            </p>
            
            <h4>Unified Risk Score</h4>
            <p>
              A risk score is generated for each protocol using a weighted blend of on-chain metrics (α), social sentiment (β), and governance signals (γ):
            </p>
            <div className={styles.formula}>
              <div className={styles.formulaContent}>
                Risk Score R = αL + βS + γG
              </div>
            </div>
            <p>Where:</p>
            <ul className={styles.formulaLegend}>
              <li><strong>L</strong> = Liquidity health indicators</li>
              <li><strong>S</strong> = Sentiment polarity trends</li>
              <li><strong>G</strong> = Governance event sensitivity</li>
            </ul>
            <p>This score powers Yieldscan's alert engine assisting our users to stay ahead of risks.</p>

            <h3>Security</h3>
            <p>Yieldscan is built with security as a first principle. Every layer of the system is designed to protect user capital through proven best practices:</p>
            
            <h4>1. Isolated Vaults</h4>
            <p>
              Each user interacts with a dedicated smart contract that holds only their assets. This architecture ensures complete separation between users, reducing systemic risk and preventing asset cross-contamination.
            </p>
            
            <h4>2. Trusted Integrations</h4>
            <p>
              Yieldscan integrates only with rigorously audited, high TVL, battle tested DeFi protocols. All third-party dependencies are reviewed, whitelisted, and continuously monitored using AI to ensure long-term reliability.
            </p>
            
            <h4>3. Strict Access Controls</h4>
            <p>
              Administrative functions are limited, access-restricted. Critical actions are non-upgradable, to eliminate unilateral risk.
            </p>
          </div>
        </section>
        <section 
          id="conclusion"
          ref={(el) => { sectionRefs.current['conclusion'] = el; }}
          className={styles.section}
        >
          <div className={`${styles.stickyTitle} ${activeSection === 'conclusion' ? styles.active : ''}`}>
            <h2>Conclusion</h2>
          </div>
          
          <div className={styles.sectionContent}>
            <p>
              Yieldscan offers an easy way to access DeFi yields without the complexity of managing multiple protocols. 
              The platform simplifies strategy selection, isolates user risk through dedicated vaults, 
              and provides clear, predictable returns. With a focus on security and transparency, Yieldscan is built for everyone, 
              from first-time users to seasoned whales. Offering simplicity, security, and control.
            </p>
            
            <div className={styles.disclaimer}>
              <h3>Disclaimer</h3>
              <p>
                Cryptocurrency investments carry inherent risks. Users should conduct thorough 
                research and consider their risk tolerance before participating. This litepaper 
                is for informational purposes only and does not constitute financial advice.
              </p>
            </div>
            
            {/* <div className={styles.contact}>
              <h3>Contact & Community</h3>
              <div className={styles.contactLinks}>
                <a href="https://yieldscan.io" target="_blank" rel="noopener noreferrer">
                  <span className={styles.contactIcon}>🌐</span> 
                  <span className={styles.contactText}>Yieldscan.io</span>
                </a>
                <a href="https://twitter.com/Yieldscan" target="_blank" rel="noopener noreferrer">
                  <span className={styles.contactIcon}>🐦</span> 
                  <span className={styles.contactText}>@Yieldscan</span>
                </a>
                <a href="https://discord.gg/yieldscan" target="_blank" rel="noopener noreferrer">
                  <span className={styles.contactIcon}>📱</span> 
                  <span className={styles.contactText}>Yieldscan Community</span>
                </a>
              </div>
            </div> */}
          </div>
        </section>
      </div>
    </div>
  );
};

export default LitepaperPage;