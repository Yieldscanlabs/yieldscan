import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import NotFound from '../pages/NotFound';
import SomethingWentWrong from '../pages/SomethingWentWrong';
import { useTheme } from '../hooks/useTheme';

// React Router sends every error here, whether it's a genuinely missing
// route (a 404 response it generates itself) or a real crash thrown while
// rendering a page. Show the right message for each instead of always
// showing "page not found" for a real crash.
const RouteErrorBoundary = () => {
  const error = useRouteError();
  // This renders outside <Layout>, which is normally what applies the
  // saved theme to the page. Calling useTheme() here re-applies it so the
  // fallback page isn't stuck in dark mode for a user on light mode.
  useTheme();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFound />;
  }

  return <SomethingWentWrong />;
};

export default RouteErrorBoundary;
