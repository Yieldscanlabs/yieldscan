import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import styles from './SettingsPage.module.css';
import { shortenAddress } from '../../utils/helpers';
import { useUserPreferencesStore } from '../../store/userPreferencesStore';
import PageHeader from '../../components/PageHeader';
import CopyWrapper from '../../components/common/CopyWrapper';
import useWalletConnection from '../../hooks/useWalletConnection';
import { useManualWalletStore } from '../../store/manualWalletStore';
import WalletModal from '../../components/WalletModal';
import WalletWelcome from '../wallet/WalletWelcome';
import { API_BASE_URL, EXMPLE_VALUE } from '../../utils/constants';
import { useCurrencyFormatter } from '../../hooks/useCurrencyFormatter';

const SettingsPage: React.FC = () => {
    const { address } = useAccount();
    const { activeDecimalDigits, setActiveDecimalDigits } = useUserPreferencesStore();
    const { wallet, isModalOpen, openConnectModal, closeConnectModal } = useWalletConnection();
    const { manualAddresses } = useManualWalletStore();
    const [isSaving, setIsSaving] = useState(false);

    const formatValue = useCurrencyFormatter();

    const handleOptionChange = async (value: number) => {
        if (!address) {
            alert("Please connect your wallet to save settings.");
            return;
        }

        // Optimistic Update (Immediate UI change)
        setActiveDecimalDigits(value);
        setIsSaving(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/user-details/${address.toLowerCase()}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ decimalPoint: value })
            });

            if (!response.ok) throw new Error("Failed to save setting");

        } catch (error) {
            console.error("Settings save failed:", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!wallet.isConnected && manualAddresses.length === 0) return <WalletWelcome onConnect={openConnectModal} />;

    return (
        <div className={styles.container}>
            <PageHeader title="Settings" subtitle="Manage your application preferences" />

            <div className={styles.settingsGroup}>
                <div className={styles.settingCard}>
                    <div className={styles.cardHeader}>
                        <h3>Display Preferences</h3>
                        <p className={styles.subtext}>
                            Settings apply to the currently connected wallet:
                            {address ? (
                                <CopyWrapper text={address} shortenText={shortenAddress(address)} />
                            ) : (
                                <span>Not Connected</span>
                            )}
                        </p>
                    </div>

                    <div className={styles.settingItem}>
                        <div className={styles.labelGroup}>
                            <label>Decimal Precision</label>
                            <span className={styles.description}>
                                Choose how many decimal places to display for currency values (Rounded Down).
                                <i style={{ color: "orange", marginLeft:'5px'}}>This will reflect throught yieldscan values except apys.</i>
                            </span>
                        </div>

                        <div className={styles.optionsContainer}>
                            {[0, 1, 2].map((opt) => (
                                <button
                                    key={opt}
                                    disabled={isSaving}
                                    className={`${styles.optionBtn} ${activeDecimalDigits === opt ? styles.active : ''}`}
                                    onClick={() => handleOptionChange(opt)}
                                >
                                    {opt} Digits
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.previewBox}>
                        <span className={styles.previewLabel}>Preview:</span>
                        <span className={styles.previewValue}>
                            ${formatValue(EXMPLE_VALUE)}
                        </span>
                        <span className={styles.previewOriginal}>(Original: $10,000.9876)</span>
                    </div>
                </div>
            </div>

            <WalletModal isOpen={isModalOpen} onClose={closeConnectModal} />
        </div>
    );
};

export default SettingsPage;