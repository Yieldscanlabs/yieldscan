import React from 'react';
import { RotateCw, Unplug } from 'lucide-react';
import styles from '../../pages/wallet/Wallet.module.css';
import { shortenAddress } from '../../utils/helpers';
import CopyWrapper from '../common/CopyWrapper';

interface EmptyStateCardProps {
    onClick: () => void;
    walletAddress?: string;
    // True when this wallet's assets failed to load (as opposed to the wallet
    // genuinely holding nothing) -- the card then asks the user to reload
    // instead of claiming the wallet is empty, since the two look identical
    // otherwise.
    loadFailed?: boolean;
    onRetry?: () => void;
}

const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
    onClick,
    walletAddress,
    loadFailed = false,
    onRetry,
}) => {

    if (loadFailed) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyState}>
                    <Unplug size={32} className={styles.loadFailedIcon} aria-hidden="true" />
                    <h3>Signal's a bit tangled</h3>
                    <div className={styles.emptyTextWrapper}>
                        {walletAddress ? (
                            <>
                                We couldn't reach the assets in{' '}
                                <CopyWrapper text={walletAddress} shortenText={shortenAddress(walletAddress as string)} />
                            </>
                        ) : (
                            "We couldn't reach your wallet this time."
                        )}
                    </div>
                    <p className={styles.subText}>
                        Your assets are still there, nothing was lost. We just missed the connection, {' '}
                        <button onClick={onRetry} className={styles.reloadLink}>
                            give it another go
                            <RotateCw size={13} strokeWidth={3} className={styles.reloadLinkIcon} aria-hidden="true" />
                        </button>.
                    </p>
                </div>
            </div>
        );
    }

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
