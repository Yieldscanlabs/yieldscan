import { createBrowserRouter, ScrollRestoration } from 'react-router-dom';
import Wallet from './pages/wallet';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import CalculatorPage from './pages/CalculatorPage';
import LitepaperPage from './pages/LitepaperPage';
import MyYieldsPage from './pages/MyYieldsPage';
import AlertsPage from './pages/AlertsPage';
import Layout from './components/Layout';
import NotFound from './pages/NotFound';
import FaqPage from './pages/FaqPage';
import LiveApyPage from './pages/live-apy';
import AboutPage from './pages/AboutPage';
import SettingsPage from './pages/settings/SettingsPage';
import LiquidityPage from './pages/liquidity';

// Define the router configuration
const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Wallet />,
      },
      {
        path: 'terms',
        element: <TermsPage />,
      },
      {
        path: 'calculator',
        element: <CalculatorPage />,
      },
      {
        path: 'privacy',
        element: <PrivacyPage />,
      },
      {
        path: 'litepaper',
        element: <LitepaperPage />,
      },
      {
        path: 'faq',
        element: <FaqPage />,
      },

      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'yields',
        element: <MyYieldsPage />,
      },
      {
        path: 'explore',
        element: <LiveApyPage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
      {
        path: 'alerts',
        element: <AlertsPage />,
      },
      {
        path: 'liquidity',
        element: <LiquidityPage />,
      },
    ],

    // Add ScrollRestoration to handle scroll position
    element: (
      <>
        <Layout />
        <ScrollRestoration />
      </>
    ),
  },
],
  // {
  //   basename: '/yieldscan', // 👈 important for GitHub Pages
  // }
);

export default router;