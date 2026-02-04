import React, { useState } from 'react';
import styles from './CopyWrapper.module.css';

interface CopyWrapperProps {
    text?: string;
    shortenText?: string | undefined;
}

const CopyWrapper: React.FC<CopyWrapperProps> = ({ text, shortenText }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!text) return;

        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <button
            className={`${styles.addressBadge} ${copied ? styles.copied : ''}`}
            onClick={handleCopy}
            title={copied?"Copied!":"Click to copy"}
        >
            <code>{shortenText ?? text}</code>
            {copied ? (
                // TICK ICON (Success)
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={styles.copyIcon}
                >
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            ) : (
                // COPY ICON (Default)
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={styles.copyIcon}
                >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
            )}
        </button>
    );
}

export default CopyWrapper;