import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import CalculatorPage from './pages/CalculatorPage';
import LitepaperPage from './pages/LitepaperPage';
import MyYieldsPage from './pages/MyYieldsPage';
import Layout from './components/Layout';
import NotFound from './pages/NotFound';
import FaqPage from './pages/FaqPage';

// Define the router configuration
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <App />,
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
        path: 'my-yields',
        element: <MyYieldsPage />,
      },
    ],
  },
]);

export default router;