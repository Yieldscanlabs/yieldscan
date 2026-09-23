import React, { useEffect, useState } from 'react';
import { Joyride, STATUS } from 'react-joyride';
import type { EventData, Step, TooltipRenderProps } from 'react-joyride';
import { useLocation } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useUserPreferencesStore } from '../store/userPreferencesStore';
import styles from './GlobalOnboardingTour.module.css';

// A small, compact tooltip matching the app's own design tokens (see
// GlobalOnboardingTour.module.css), replacing Joyride's default box --
// which was oversized and didn't match the app's dark/light theme. Progress
// is shown as small dots instead of a "(2 of 3)" counter.
const OnboardingTooltip: React.FC<TooltipRenderProps> = ({
  index,
  size,
  step,
  isLastStep,
  primaryProps,
  skipProps,
  tooltipProps,
}) => (
  <div {...tooltipProps} className={styles.tooltip}>
    {step.title ? <div className={styles.title}>{step.title}</div> : null}
    <div className={styles.content}>{step.content}</div>
    <div className={styles.footer}>
      <button {...skipProps} className={styles.skipButton}>
        Skip
      </button>
      <div className={styles.dots}>
        {Array.from({ length: size }).map((_, i) => (
          <span
            key={i}
            className={i === index ? `${styles.dot} ${styles.dotActive}` : styles.dot}
          />
        ))}
      </div>
      {/* No forward button on step 0 -- the real next action there is
          clicking the highlighted Connect Wallet button itself. */}
      {index === 0 ? (
        <span />
      ) : (
        <button {...primaryProps} className={styles.primaryButton}>
          {isLastStep ? 'Got it!' : 'Next'}
        </button>
      )}
    </div>
  </div>
);

// Only 3 stops: connect a wallet, then the two main post-connect pages.
// Steps 2/3's targets (the nav links) only render once a wallet is
// connected, so this tour is driven by connection state rather than being a
// single static sequence -- see the two effects below.
const steps: Step[] = [
  {
    target: '[data-tour="connect-wallet"]',
    title: '👋 Welcome to YieldScan!',
    content: "Let's get you set up. Connect your wallet and we'll show you around.",
    skipBeacon: true,
    placement: 'bottom',
    // No forward button rendered for this step in OnboardingTooltip above:
    // the real next action is clicking the highlighted Connect Wallet
    // button itself, which advances the tour via the connection-watching
    // effect below.
  },
  {
    target: '[data-tour="nav-my-yields"]',
    title: '💰 My Yields',
    content: "You're in! This is where you'll find every position you hold and exactly how much it's earning you.",
    skipBeacon: true,
  },
  {
    target: '[data-tour="nav-liquidity"]',
    title: '💧 Liquidity',
    content: "One last stop. Liquidity shows you on-chain liquidity for your assets, so you know how easily you can move your funds.",
    skipBeacon: true,
  },
];

const GlobalOnboardingTour: React.FC = () => {
  const { pathname } = useLocation();
  const { isConnected } = useAccount();
  const { hasSeenOnboardingTour, setHasSeenOnboardingTour } = useUserPreferencesStore();
  const [stepIndex, setStepIndex] = useState(0);
  const [run, setRun] = useState(false);
  // Tracks "step 0 has already been shown once," separately from `run`
  // (which also flips to false once the user clicks the target, per the
  // effect below) -- without this, hiding on click would re-arm the same
  // start effect below and bring step 0 right back a moment later, since
  // nothing else about the page has changed.
  const [hasStartedTour, setHasStartedTour] = useState(false);

  // Start at step 0 the first time a not-yet-connected visitor lands on the
  // Wallet page (the only place the connect-wallet target exists).
  useEffect(() => {
    if (hasSeenOnboardingTour || hasStartedTour || isConnected) return;
    if (pathname !== '/') return;
    const timer = setTimeout(() => {
      setHasStartedTour(true);
      setRun(true);
    }, 600); // let the page settle first
    return () => clearTimeout(timer);
  }, [hasSeenOnboardingTour, hasStartedTour, isConnected, pathname]);

  // Hide the tooltip the instant the real Connect Wallet button is clicked --
  // its job (pointing the user at the button) is done at that point, and
  // leaving it open otherwise sits on top of the wallet-selection modal that
  // opens next, blocking the actual wallet options underneath it.
  useEffect(() => {
    if (!run || stepIndex !== 0) return;
    const target = document.querySelector('[data-tour="connect-wallet"]');
    if (!target) return;
    const hideOnClick = () => setRun(false);
    target.addEventListener('click', hideOnClick);
    return () => target.removeEventListener('click', hideOnClick);
  }, [run, stepIndex]);

  // Once the wallet connects, jump straight to the post-connect steps --
  // covers both "just finished step 0" and "connected before ever seeing
  // step 0" (e.g. already had a wallet extension auto-connect).
  useEffect(() => {
    if (hasSeenOnboardingTour || !isConnected) return;
    if (run && stepIndex >= 1) return; // already on/past the post-connect steps
    setStepIndex(1);
    const timer = setTimeout(() => setRun(true), 600);
    return () => clearTimeout(timer);
  }, [isConnected, hasSeenOnboardingTour]);

  const handleEvent = (data: EventData) => {
    const { status, index, action, type } = data;

    if (type === 'step:after' && action === 'next') {
      setStepIndex(index + 1);
    }

    // A target not being on screen (e.g. nav links hidden on a narrow
    // viewport) should end the tour gracefully rather than getting stuck.
    if (
      status === STATUS.FINISHED ||
      status === STATUS.SKIPPED ||
      type === 'error:target_not_found'
    ) {
      setRun(false);
      setHasSeenOnboardingTour(true);
    }
  };

  if (hasSeenOnboardingTour) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      continuous
      onEvent={handleEvent}
      tooltipComponent={OnboardingTooltip}
      options={{
        // The tooltip box itself is fully custom (see OnboardingTooltip
        // above) and styled directly from the app's theme variables, so
        // only the pieces Joyride still renders itself -- the arrow and the
        // dimmed overlay behind the spotlight -- need colors here.
        arrowColor: 'var(--surface-medium)',
        overlayColor: 'var(--surface-overlay)',
        // Clicking the dimmed overlay closes the current step internally
        // without firing a "skipped"/"finished" status, so the external
        // run/stepIndex state (driven by our own effects) never learns the
        // tour should end -- leaving the dimmed overlay stuck on screen
        // with no tooltip. Disabling it entirely avoids that: the only way
        // to leave the tour is the explicit Skip/Next buttons.
        overlayClickAction: false,
        // Joyride scrolls the page to bring each target into view by
        // default -- on the very first step this made the page jump down
        // from its normal load position (top). The connect-wallet button is
        // already on screen on load, so this isn't needed here.
        skipScroll: true,
        spotlightRadius: 12, // matches --radius-md
        zIndex: 10000,
      }}
    />
  );
};

export default GlobalOnboardingTour;
