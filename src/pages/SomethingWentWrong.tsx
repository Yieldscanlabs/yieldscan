import { useNavigate } from 'react-router-dom';
import styles from './SomethingWentWrong.module.css';

const SomethingWentWrong = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.iconWrap}>
          <svg
            className={styles.chainIcon}
            width="72"
            height="72"
            viewBox="0 0 72 72"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g className={styles.linkLeft}>
              <rect x="6" y="26" width="26" height="20" rx="10" stroke="url(#g1)" strokeWidth="4" />
            </g>
            <g className={styles.linkRight}>
              <rect x="40" y="26" width="26" height="20" rx="10" stroke="url(#g1)" strokeWidth="4" />
            </g>
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="72" y2="72" gradientUnits="userSpaceOnUse">
                <stop stopColor="var(--primary-color)" />
                <stop offset="1" stopColor="var(--secondary-color)" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <h1 className={styles.title}>Something Went Wrong</h1>
        <p className={styles.subtitle}>
          The app hit an unexpected snag. Your funds and data are safe, this is just a display hiccup.
        </p>

        <div className={styles.traceLine}>
          <span className={styles.dot} />
          runtime_error: unexpected_state
        </div>

        <div className={styles.actions}>
          <button className={styles.primaryButton} onClick={() => window.location.reload()}>
            Reload Page
          </button>
          <button className={styles.secondaryButton} onClick={() => navigate('/')}>
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default SomethingWentWrong;
