// Add this to your existing Navbar component

// Inside your Navbar component, add the "My Yields" link when the user is connected
{isConnected && (
  <Link to="/my-yields" className={location.pathname === '/my-yields' ? styles.active : ''}>
    My Yields
  </Link>
)}