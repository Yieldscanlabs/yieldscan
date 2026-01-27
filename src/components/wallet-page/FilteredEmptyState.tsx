import React from 'react';
import styles from '../../pages/wallet/Wallet.module.css';

interface FilteredEmptyStateProps {
    onReset: () => void;
}

const FilteredEmptyState: React.FC<FilteredEmptyStateProps> = ({ onReset }) => {
    return (
        <div className={styles.filteredEmptyState}>
            <div className={styles.filteredEmptyContent}>
                <div className={styles.filteredEmptyIcon}>🔍</div>

                <div className={styles.filteredEmptyText}>
                    <h3>No matching assets found</h3>
                    <p>No assets match your current filters.</p>
                </div>

                <button
                    className={styles.resetFiltersButton}
                    onClick={onReset}
                >
                    Reset Filters
                </button>
            </div>
        </div>
    );
};

export default FilteredEmptyState;
