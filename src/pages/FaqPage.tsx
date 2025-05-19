import React from 'react';
import styles from './FaqPage.module.css';

interface FaqItem {
  question: string;
  answer: React.ReactNode;
  category?: string;
}

const FaqPage: React.FC = () => {
  const faqItems: FaqItem[] = [
    // General section
    {
      question: "What is YieldScan?",
      answer: (
        <p>
          Yieldscan is a DeFi yield aggregator that helps users find and optimize the best returns on their 
          yield-bearing crypto assets—without oracles, validators, or automated rebalancing.
        </p>
      ),
      category: "general"
    },
    {
      question: "How is YieldScan different from other DeFi yield platforms?",
      answer: (
        <p>
          Yieldscan is an information layer, you interact directly with protocols like Aave, Compound, and Morpho.
          We don't take custody of your funds or require you to deposit into a vault.
          Instead, we provide real-time yield comparisons and one-click migration options to help you earn more.
        </p>
      ),
      category: "general"
    },
    
    // Yield & Optimization section
    {
      question: "How does YieldScan find the best yields?",
      answer: (
        <p>
          We monitor APYs from top protocols like Aave, Compound, Morpho, and Pendle in real-time, 
          highlighting better opportunities for yield-bearing assets like aUSDC or cDAI.
        </p>
      ),
      category: "yield"
    },
    {
      question: "What does \"optimize yield\" mean?",
      answer: (
        <p>
          If you're holding a token like aUSDC but cUSDC is yielding more, we'll show you a one-click option 
          to migrate and earn more—without you having to compare rates manually.
        </p>
      ),
      category: "yield"
    },
    {
      question: "Does YieldScan support base tokens (e.g., USDC)?",
      answer: (
        <p>
          Yes. For base tokens, we show available options across protocols so you can choose the best place 
          to deposit initially.
        </p>
      ),
      category: "yield"
    },
    
    // Security section
    {
      question: "Is my crypto safe on YieldScan?",
      answer: (
        <p>
          Yes. YieldScan does not take custody of your funds. All actions are initiated by you directly on 
          trusted protocols via your connected wallet.
        </p>
      ),
      category: "security"
    },
    {
      question: "Are there smart contract risks?",
      answer: (
        <p>
          As with any DeFi interaction, risks exist. We only surface protocols with established security records, 
          and you choose where and when to interact.
        </p>
      ),
      category: "security"
    },
    
    // Technical section
    {
      question: "What tokens are supported?",
      answer: (
        <p>
          We currently support major stablecoins and their yield-bearing versions (USDC, USDT, aUSDC, cUSDC, etc.). 
          More tokens are added regularly.
        </p>
      ),
      category: "technical"
    },
    {
      question: "Which blockchains are supported?",
      answer: (
        <p>
          Initially focused on Ethereum mainnet. Support for L2s like Arbitrum and Base is coming soon.
        </p>
      ),
      category: "technical"
    },
    {
      question: "Do I need to approve tokens?",
      answer: (
        <p>
          Yes. As with any dApp, you'll need to approve tokens before interacting with protocols. 
          We guide you through each step clearly.
        </p>
      ),
      category: "technical"
    },
    
    // Strategy & Performance section
    {
      question: "Is there a fee for using YieldScan?",
      answer: (
        <p>
          No platform fees. If using an optimizer vault (coming soon), we charge a transparent, 
          yield-based performance fee.
        </p>
      ),
      category: "strategy"
    },
    {
      question: "Can I see my performance over time?",
      answer: (
        <p>
          Yes. YieldScan offers portfolio tracking and historical yield comparisons so you can see how 
          much better you're doing.
        </p>
      ),
      category: "strategy"
    },
    
    // Other section
    {
      question: "Do you use AI?",
      answer: (
        <p>
          Yes. Our AI models monitor social sentiment and liquidity changes across DeFi to alert you 
          if something looks risky in a protocol you're using.
        </p>
      ),
      category: "other"
    },
    {
      question: "Who is YieldScan for?",
      answer: (
        <p>
          Anyone looking to make the most of their yield-bearing assets—whether you're a DeFi veteran 
          or just starting out.
        </p>
      ),
      category: "other"
    }
  ];

  // Group FAQs by category
  const categories = [
    { id: "general", label: "General" },
    { id: "yield", label: "Yield & Optimization" },
    { id: "security", label: "Security" },
    { id: "technical", label: "Technical" },
    { id: "strategy", label: "Strategy & Performance" },
    { id: "other", label: "Other" }
  ];

  return (
    <div className={styles.faqPage}>
      <h1>Frequently Asked Questions</h1>
      
      <div className={styles.faqContainer}>
        {categories.map((category) => (
          <div key={category.id} className={styles.categorySection}>
            <h2 className={styles.categoryTitle}>{category.label}</h2>
            
            {faqItems
              .filter(item => item.category === category.id)
              .map((item, index) => (
                <div key={index} className={styles.faqItem}>
                  <h3 className={styles.question}>{item.question}</h3>
                  <div className={styles.answer}>{item.answer}</div>
                </div>
              ))
            }
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <p>Can't find what you're looking for? <a href="mailto:support@yieldscan.io">Contact our team</a></p>
      </div>
    </div>
  );
};

export default FaqPage;