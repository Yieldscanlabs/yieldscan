import React from 'react';
import styles from '../../pages/wallet/Wallet.module.css';
import { shortenAddress } from '../../utils/helpers';
import CopyWrapper from '../common/CopyWrapper';

interface EmptyStateCardProps {
    onClick: () => void;
    walletAddress?: string;
}

const EmptyStateCard: React.FC<EmptyStateCardProps> = ({ onClick, walletAddress }) => {

    return (
        <div className={styles.container}>
            <div className={styles.emptyState}>
                <h3>No Assets Found</h3>
                <div className={styles.emptyTextWrapper}>
                    {walletAddress ? (
                        <>
                            No assets found in{' '}
                            <CopyWrapper text={walletAddress} shortenText={shortenAddress(walletAddress as string)} />
                        </>
                    ) : (
                        "You don't have any assets yet."
                    )}
                </div>
                <p className={styles.subText}>
                    Click the button below to explore yield opportunities.
                </p>
                <button onClick={onClick} className={styles.exploreButton}>
                    Explore Yield Opportunities
                </button>
            </div>
        </div>
    );
};

export default EmptyStateCard;