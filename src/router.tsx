import { createBrowserRouter, ScrollRestoration } from 'react-router-dom';
import Wallet from './pages/wallet';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import CalculatorPage from './pages/CalculatorPage';
import LitepaperPage from './pages/LitepaperPage';
import MyYieldsPage from './pages/MyYieldsPage';
import Layout from './components/Layout';
import NotFound from './pages/NotFound';
import FaqPage from './pages/FaqPage';
import LiveApyPage from './pages/live-apy';
import AboutPage from './pages/AboutPage';

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
    ],
    // Add ScrollRestoration to handle scroll position
    element: (
      <>
        <Layout />
        <ScrollRestoration />
      </>
    ),
  },
]);

export default router;