# Header Component

A modular, responsive header component for the YieldScan application with desktop navigation, mobile menu, wallet integration, and earnings display.

## 📁 File Structure

```
src/components/Header/
├── index.tsx              # Main Header orchestrator component
├── Header.module.css      # All styles for header components
├── utils.ts              # Helper functions (explorer URLs, clipboard)
├── README.md             # This documentation file
└── components/           # Individual header sub-components
    ├── DesktopHeader.tsx     # Desktop header layout
    ├── Navigation.tsx        # Desktop navigation links
    ├── EarningsDisplay.tsx   # Total savings display
    ├── WalletSection.tsx     # Wallet address & dropdown
    ├── HamburgerButton.tsx   # Mobile menu hamburger button
    └── MobileMenu.tsx        # Full-screen mobile menu
```

## 🚀 Usage

```tsx
import Header from './components/Header';

<Header 
  isConnected={wallet.isConnected}
  address={wallet.address}
  disconnectWallet={disconnectWallet}
/>
```

## 📱 Responsive Behavior

### Desktop (>900px)
- Full navigation links in header
- Logo with text "YIELDSCAN"
- Earnings display with "Total Savings:" label
- Wallet dropdown with full functionality

### Mobile/Tablet (≤900px)
- Hamburger menu button appears
- Desktop navigation hidden
- Logo shows only owl image (no text)
- Earnings display hidden from header
- Full-screen mobile menu available

## 🔧 Component Breakdown

### `index.tsx` - Main Orchestrator
**Responsibilities:**
- State management (dropdown, mobile menu, copy success, scroll visibility)
- Data calculations (total holdings, weighted APY)
- Live ticker effect for earnings
- Event handlers (scroll, click outside, route changes)
- Coordinates all sub-components

**Key Features:**
- Auto-hide header on scroll down
- Live earnings calculation with 100ms updates
- Body scroll prevention when mobile menu open
- Automatic cleanup of timers and event listeners

### `components/DesktopHeader.tsx` - Desktop Layout
**Responsibilities:**
- Main header structure and layout
- Orchestrates logo, navigation, earnings, wallet, and hamburger components
- Responsive visibility classes

### `components/Navigation.tsx` - Desktop Navigation
**Responsibilities:**
- Desktop navigation links with active states
- Conditional "My Yields" link (only when connected)
- Route-based active link highlighting

**Links:**
- Wallet (/)
- My Yields (/yields) - *conditional*
- Explore (/explore)
- Alerts (/alerts)

### `components/EarningsDisplay.tsx` - Earnings Badge
**Responsibilities:**
- Display live-updating total savings
- Responsive visibility (hidden ≤900px)
- Formatted value display with 18 decimal places

**Features:**
- Real-time value updates
- Responsive text hiding
- Professional gradient styling

### `components/WalletSection.tsx` - Wallet Functionality
**Responsibilities:**
- Wallet address display with dropdown
- Copy address to clipboard
- Open address in blockchain explorer
- Theme toggle integration
- Disconnect wallet functionality

**Dropdown Actions:**
- Copy Address
- View on Explorer
- Theme Toggle
- Disconnect

### `components/HamburgerButton.tsx` - Mobile Toggle
**Responsibilities:**
- Animated hamburger icon
- Mobile-only visibility (≤900px)
- Transforms to X when menu open

**Features:**
- Smooth CSS animations
- Accessible ARIA labels
- Three-line to X transformation

### `components/MobileMenu.tsx` - Mobile Navigation
**Responsibilities:**
- Full-screen mobile menu overlay
- Mobile navigation with active states
- Mobile earnings display
- Menu close functionality

**Features:**
- Slides in from right side
- Full viewport coverage
- Navigation links with active states
- Mobile-optimized earnings display
- Close on navigation or overlay click

## 🎨 Styling

All styles are contained in `Header.module.css` with the following key patterns:

### CSS Classes by Component:
- **Header**: `.header`, `.headerVisible`, `.headerHidden`, `.headerLeft`, `.headerRight`
- **Navigation**: `.navigation`, `.navLink`, `.activeLink`
- **Earnings**: `.earningsContainer`, `.earningsBadgeTotal`, `.earningsLabel`, `.earningsAmount`
- **Wallet**: `.walletContainer`, `.walletAddress`, `.walletDropdown`, `.dropdownButton`
- **Mobile**: `.hamburgerButton`, `.mobileMenu`, `.mobileNavigation`, `.mobileNavLink`

### Responsive Breakpoints:
- **1200px**: Earnings badge size adjustments
- **900px**: Mobile menu activation, earnings container hidden
- **768px**: Additional mobile optimizations
- **480px**: Smallest screen optimizations

## 🔄 State Management

### Local State:
```tsx
const [isDropdownOpen, setIsDropdownOpen] = useState(false);      // Wallet dropdown
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);  // Mobile menu
const [copySuccess, setCopySuccess] = useState(false);            // Copy feedback
const [isVisible, setIsVisible] = useState(true);                 // Header visibility
const [totalValue, setTotalValue] = useState(initialValue);       // Live earnings
```

### External Dependencies:
- **Zustand Stores**: `useAssetStore`, `useApyStore`
- **React Router**: `useLocation`
- **Wagmi**: `useAccount`
- **Utilities**: `shortenAddress` from helpers

## 🎯 Key Features

### Live Earnings Ticker
- Updates every 100ms for visible decimal changes
- Calculates weighted APY across all yield-bearing assets
- Proper number formatting with commas and 18 decimals
- Fallback values for edge cases

### Responsive Design
- Mobile-first approach with progressive enhancement
- Breakpoint-based component visibility
- Adaptive text and spacing
- Touch-friendly mobile interactions

### Accessibility
- Proper ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader friendly
- Focus management for modals

### Performance
- Efficient re-renders with React.memo potential
- Cleanup of timers and event listeners
- Optimized scroll event handling
- Minimal DOM manipulation

## 🔧 Customization

### Adding New Navigation Links
1. Update `components/Navigation.tsx` and `components/MobileMenu.tsx`
2. Add new route styling in `Header.module.css`
3. Test responsive behavior

### Modifying Breakpoints
1. Update CSS media queries in `Header.module.css`
2. Ensure all components respect new breakpoints
3. Test across different screen sizes

### Styling Changes
1. All styles centralized in `Header.module.css`
2. Use CSS custom properties for theming
3. Follow existing naming conventions

## 🐛 Common Issues

### Mobile Menu Not Closing
- Ensure `mobileMenuRef` is properly attached
- Check click outside handler implementation
- Verify route change effect

### Earnings Not Updating
- Check wallet connection state
- Verify asset store data
- Ensure timer cleanup in useEffect

### Responsive Issues
- Test all breakpoints
- Check CSS specificity
- Verify media query order

## 🔮 Future Enhancements

- [ ] Animation improvements for mobile menu
- [ ] Accessibility audit and improvements
- [ ] Performance optimization with React.memo
- [ ] Unit tests for all components
- [ ] Storybook documentation
- [ ] Dark/light theme refinements 