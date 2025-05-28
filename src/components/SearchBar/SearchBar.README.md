# SearchBar Component

A reusable search input component with dark/light mode support and modern styling that fits seamlessly with the YieldScan design system.

## Features

- 🎨 **Consistent Design**: Matches the project's dark/light mode theming
- 🔍 **Interactive Icons**: Search icon that changes color on focus
- ✨ **Clear Functionality**: Built-in clear button when there's text
- 📱 **Responsive**: Adapts to different screen sizes
- ♿ **Accessible**: Proper ARIA labels and keyboard navigation
- 🎯 **Flexible**: Customizable placeholder, value, and styling

## Props

| Prop        | Type                        | Default      | Description                                    |
|-------------|----------------------------|--------------|------------------------------------------------|
| `placeholder` | `string`                 | `"Search..."` | Placeholder text shown when input is empty    |
| `value`     | `string`                   | `""`         | Current value of the search input              |
| `onChange`  | `(value: string) => void`  | Required     | Callback function called when value changes    |
| `className` | `string`                   | `""`         | Additional CSS classes for custom styling      |
| `disabled`  | `boolean`                  | `false`      | Whether the search input is disabled           |

## Usage

### Basic Usage

```tsx
import { useState } from 'react';
import SearchBar from './components/SearchBar';

function MyComponent() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SearchBar
      placeholder="Search items..."
      value={searchQuery}
      onChange={setSearchQuery}
    />
  );
}
```

### Filtering Data

```tsx
import { useState } from 'react';
import SearchBar from './components/SearchBar';

function FilterableList() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const items = ['Apple', 'Banana', 'Cherry', 'Date'];
  
  const filteredItems = items.filter(item =>
    item.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <SearchBar
        placeholder="Search fruits..."
        value={searchQuery}
        onChange={setSearchQuery}
      />
      <ul>
        {filteredItems.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
```

### With Custom Styling

```tsx
<SearchBar
  placeholder="Search cryptocurrencies..."
  value={searchQuery}
  onChange={setSearchQuery}
  className="my-custom-search"
/>
```

### Disabled State

```tsx
<SearchBar
  placeholder="Search not available"
  value=""
  onChange={() => {}}
  disabled={true}
/>
```

## Styling

The component uses CSS modules and CSS variables from the project's design system:

- `--surface-medium`: Background color
- `--border-color`: Border color  
- `--text-primary`: Text color
- `--text-secondary`: Placeholder and icon color
- `--primary-color`: Focus state color
- `--radius-md`: Border radius
- `--transition-speed`: Animation timing

### CSS Variables Used

```css
.searchContainer {
  background: var(--surface-medium);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.searchInput {
  color: var(--text-primary);
}

.searchIcon {
  color: var(--text-secondary);
}

.focused .searchIcon {
  color: var(--primary-color);
}
```

## Accessibility

- Proper keyboard navigation support
- ARIA label for clear button
- Focus indicators
- Screen reader friendly
- Disabled state handling

## Browser Support

- Modern browsers with CSS custom properties support
- Responsive design works on mobile and desktop
- Tested with dark and light themes

## Related Components

- `NetworkSelector`: For filtering by blockchain network
- `ViewToggle`: For switching between list and table views
- `AssetList`/`AssetTable`: Components that can be filtered using this SearchBar

## Examples

See `SearchBarDemo.tsx` for a complete interactive example showcasing all features and use cases. 