import React from 'react';
import '../App.css'; // Using the styles from App.css instead of a module

interface LoadingProps {
  message?: string;
  subtitle?: string;
}

const Loading: React.FC<LoadingProps> = ({ 
  message = "Loading your assets",
  subtitle = "Scanning blockchain for your tokens..."
}) => {
  return (
    <div className="loading">
      <div className="loading-spinner"></div>
      <div className="loading-message">{message}</div>
      <div className="loading-subtitle">{subtitle}</div>
    </div>
  );
};

export default Loading;