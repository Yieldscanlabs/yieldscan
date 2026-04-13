import React, { useMemo, useState } from "react";
import styles from "./WalletModal.module.css";
import { useManualWalletStore } from "../store/manualWalletStore";
import { useAccount } from "wagmi";
import { shortenAddress } from "../utils/helpers";
import useWallet from "../hooks/useWalletConnection";

interface ManualWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address.trim());
}

const ManualWalletModal: React.FC<ManualWalletModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    manualAddresses,
    addManualAddress,
    removeManualAddress,
    setActiveManualAddress,
    setWalletLabel,
    getWalletLabel,
  } = useManualWalletStore();

  const [input, setInput] = useState<string>("");
  const [walletName, setWalletName] = useState<string>(""); // ✅ new field
  const [error, setError] = useState<string>("");
  const { address: metamaskAddress, isConnected } = useAccount();

  const valid = useMemo(() => isValidAddress(input), [input]);

  const { disconnectWallet } = useWallet();

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!valid) {
      setError("Enter a valid EVM address.");
      return;
    }

    const trimmedInput = input.trim().toLowerCase();

    // Check for duplicates in manual addresses
    const isDuplicate = manualAddresses.some(
      (addr) => addr.toLowerCase() === trimmedInput,
    );

    // Check if it's the same as MetaMask address
    if (
      isConnected &&
      metamaskAddress &&
      metamaskAddress.toLowerCase() === trimmedInput
    ) {
      setError("This address is already connected via MetaMask.");
      return;
    }

    if (isDuplicate) {
      setError("This wallet address already exists.");
      return;
    }

    // Check max limit
    if (manualAddresses.length >= 5) {
      setError("Maximum 5 wallets allowed.");
      return;
    }

    try {
      addManualAddress(input.trim());

      // ✅ Save wallet name if provided
      if (walletName.trim()) {
        setWalletLabel(input.trim(), walletName.trim());
      }

      setActiveManualAddress(manualAddresses.length);

      setInput("");
      setWalletName(""); // ✅ reset name field
      setError("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to add wallet address.");
    }
  };

  const handleRemove = (index: number) => {
    try {
      removeManualAddress(index);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to remove wallet address.");
    }
  };

  const handleOverlayClick = () => {
    onClose();
  };

  const stopPropagation: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();
  };

  const isMaxWallets = manualAddresses.length >= 5;

  // ✅ Helper to display name or shortened address
  const getDisplayName = (address: string) => {
    const label = getWalletLabel(address);
    return label || shortenAddress(address);
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal} onClick={stopPropagation}>
        <div className={styles.header}>
          <h2>Add wallet address</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className={styles.content}>
          {/* ✅ Wallet Name Input — NEW */}
          <label style={{ display: "block", marginBottom: "8px" }}>
            Wallet name (optional)
          </label>
          <input
            type="text"
            placeholder="e.g. My Main Wallet"
            value={walletName}
            onChange={(e) => setWalletName(e.target.value)}
            className={styles.input}
            disabled={isMaxWallets}
            style={{ marginBottom: "1rem" }}
          />

          {/* Wallet Address Input — existing */}
          <label style={{ display: "block", marginBottom: "8px" }}>
            Wallet address (EVM)
          </label>
          <input
            type="text"
            placeholder="0x..."
            value={input}
            onChange={(e) => {
              setInput(e.target.value.toLocaleLowerCase());
              setError("");
            }}
            className={styles.input}
            autoFocus
            disabled={isMaxWallets}
          />
          {error && <p className={styles.errorText}>{error}</p>}
          {!input && !error && (
            <p className={styles.helperText}>
              {isMaxWallets
                ? "Maximum 5 wallets reached. Remove a wallet to add a new one."
                : "Paste an EVM address to watch balances."}
            </p>
          )}
          {input && !valid && !error && (
            <p className={styles.errorText}>Enter a valid EVM address.</p>
          )}

          {/* Existing Wallets List */}
          <div style={{ marginTop: "1.5rem", marginBottom: "0.75rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "0.875rem",
                color: "var(--text-tertiary)",
              }}
            >
              Existing Wallets:
            </label>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {/* MetaMask wallet row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.75rem",
                  background: "var(--surface-light)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  gap: "0.5rem",
                }}
              >
                <div style={{ flex: 1 }}>
                  {/* ✅ Show MetaMask label if exists, else show address */}
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.875rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {metamaskAddress ? getDisplayName(metamaskAddress) : ""}
                  </span>
                  {/* ✅ Always show address below name as subtitle */}
                  {metamaskAddress && getWalletLabel(metamaskAddress) && (
                    <span
                      style={{
                        display: "block",
                        fontSize: "0.75rem",
                        color: "var(--text-tertiary)",
                        fontFamily: "monospace",
                      }}
                    >
                      {shortenAddress(metamaskAddress)}
                    </span>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    disconnectWallet();
                    onClose();
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--text-tertiary)",
                    fontSize: "1.25rem",
                    cursor: "pointer",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "4px",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--error-color)";
                    e.currentTarget.style.backgroundColor =
                      "rgba(255, 0, 0, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--text-tertiary)";
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                  title="Remove wallet"
                >
                  ×
                </button>
              </div>

              {/* Manual wallet rows */}
              {manualAddresses.length > 0 && (
                <>
                  {manualAddresses.map((address, index) => (
                    <div
                      key={address}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.75rem",
                        background: "var(--surface-light)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "8px",
                        gap: "0.5rem",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        {/* ✅ Show name if exists, else show address */}
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontSize: "0.875rem",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {getDisplayName(address)}
                        </span>
                        {/* ✅ Show address as subtitle if name exists */}
                        {getWalletLabel(address) && (
                          <span
                            style={{
                              display: "block",
                              fontSize: "0.75rem",
                              color: "var(--text-tertiary)",
                              fontFamily: "monospace",
                            }}
                          >
                            {shortenAddress(address)}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemove(index)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "var(--text-tertiary)",
                          fontSize: "1.25rem",
                          cursor: "pointer",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "var(--error-color)";
                          e.currentTarget.style.backgroundColor =
                            "rgba(255, 0, 0, 0.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "var(--text-tertiary)";
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                        title="Remove wallet"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.secondaryButton} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.primaryButton}
            onClick={handleAdd}
            disabled={!valid || isMaxWallets}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualWalletModal;
