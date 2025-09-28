import React, { useState } from 'react';
import styles from './SendMessageModal.module.css'; // You'll create this CSS module

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSend: (message: string) => void;
}

const SendMessageModal: React.FC<Props> = ({ isOpen, onClose, onSend }) => {
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage('');
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>Send Message</h2>
        <textarea
          className={styles.textarea}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here..."
        />
        <div className={styles.buttons}>
          <button className={styles.cancelButton} onClick={onClose}>Cancel</button>
          <button className={styles.sendButton} onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default SendMessageModal;
