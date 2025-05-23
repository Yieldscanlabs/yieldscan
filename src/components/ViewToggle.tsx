import styles from './ViewToggle.module.css';

export type ViewType = 'cards' | 'table';

interface ViewToggleProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  return (
    <div className={styles.viewToggle}>
      <button
        className={`${styles.toggleButton} ${currentView === 'cards' ? styles.active : ''}`}
        onClick={() => onViewChange('cards')}
        type="button"
        title="Card View"
      >
        <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z"/>
        </svg>
      </button>
      <button
        className={`${styles.toggleButton} ${currentView === 'table' ? styles.active : ''}`}
        onClick={() => onViewChange('table')}
        type="button"
        title="Table View"
      >
        <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2zm0 4h18v2H3v-2z"/>
        </svg>
      </button>
    </div>
  );
}

export default ViewToggle; 