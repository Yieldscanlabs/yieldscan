import React, { useEffect, useState } from 'react';
import styles from './ExplorerSelectionModal.module.css';
import { createPortal } from 'react-dom';
import { X, ExternalLink, Layers } from 'lucide-react'; // Assuming you use lucide-react or similar for icons
import CopyWrapper from '../common/CopyWrapper';

interface ExplorerSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    walletAddress: string;
}

const EXPLORERS = [
    { name: 'Etherscan', url: 'https://etherscan.io/address/', icon: 'https://etherscan.io/images/favicon3.ico' },
    { name: 'BscScan', url: 'https://bscscan.com/address/', icon: 'https://bscscan.com/images/favicon.ico' },
    { name: 'Arbiscan', url: 'https://arbiscan.io/address/', icon: 'https://arbiscan.io/images/favicon.ico' },
    { name: 'PolygonScan', url: 'https://polygonscan.com/address/', icon: 'https://polygonscan.com/images/favicon.ico' },
    { name: 'Optimism', url: 'https://optimistic.etherscan.io/address/', icon: 'https://optimistic.etherscan.io/images/favicon.ico' },
];

const ExplorerSelectionModal: React.FC<ExplorerSelectionModalProps> = ({ isOpen, onClose, walletAddress }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300); // Match CSS transition
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    const handleOpenExplorer = (baseUrl: string) => {
        window.open(`${baseUrl}${walletAddress}`, '_blank', 'noopener,noreferrer');
        onClose();
    };

    const handleOpenAll = () => {
        EXPLORERS.forEach((explorer) => {
            window.open(`${explorer.url}${walletAddress}`, '_blank', 'noopener,noreferrer');
        });
        onClose();
    };

    return createPortal(
        <div className={`${styles.overlay} ${isOpen ? styles.open : ''}`} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3>Select Explorer</h3>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.addressPreview}>
                    Viewing: <CopyWrapper text={walletAddress} />
                </div>

                <div className={styles.list}>
                    {EXPLORERS.map((explorer) => (
                        <button
                            key={explorer.name}
                            className={styles.optionBtn}
                            onClick={() => handleOpenExplorer(explorer.url)}
                        >
                            <div className={styles.optionLeft}>
                                <img src={`https://www.google.com/s2/favicons?domain=${explorer.url}` || explorer.icon} alt={explorer.name} className={styles.icon} />
                                <span>{explorer.name}</span>
                            </div>
                            <ExternalLink size={16} className={styles.arrowIcon} />
                        </button>
                    ))}
                </div>

                <div className={styles.footer}>
                    <button className={styles.openAllBtn} onClick={handleOpenAll}>
                        <Layers size={16} />
                        Open in All Explorers
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ExplorerSelectionModal;