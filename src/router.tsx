import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import Layout from './components/Layout';
import NotFound from './pages/NotFound';

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
        path: 'privacy',
        element: <PrivacyPage />,
      },
    ],
  },
]);

export default router;