# ThumbSlider Component

A customizable slider component with thumb indicator, quick percentage buttons, and optional badge display.

## Features

- **Interactive thumb slider** with visual percentage display
- **Quick percentage buttons** for common values (25%, 50%, 75%, 100%)
- **Customizable range** (min/max values)
- **Optional badge** for displaying additional information (e.g., APY)
- **Disabled state** support
- **Light/dark theme** support
- **Smooth animations** and hover effects

## Basic Usage

```tsx
import ThumbSlider from './components/ThumbSlider';

function MyComponent() {
  const [value, setValue] = useState(50);

  return (
    <ThumbSlider
      value={value}
      onChange={setValue}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | - | Current slider value (required) |
| `onChange` | `(value: number) => void` | - | Callback when value changes (required) |
| `min` | `number` | `0` | Minimum slider value |
| `max` | `number` | `100` | Maximum slider value |
| `step` | `number` | `1` | Step increment for slider |
| `showPercentage` | `boolean` | `true` | Show percentage in thumb |
| `showQuickButtons` | `boolean` | `true` | Show quick percentage buttons |
| `quickPercentages` | `QuickPercentage[]` | `[{value: 25, label: '25%'}, ...]` | Custom quick button values |
| `badge` | `React.ReactNode` | - | Optional badge content (e.g., APY) |
| `className` | `string` | `''` | Additional CSS classes |
| `disabled` | `boolean` | `false` | Disable slider interaction |

## Advanced Examples

### Custom Range Slider
```tsx
<ThumbSlider
  value={amountValue}
  onChange={setAmountValue}
  min={0}
  max={10000}
  step={100}
  showPercentage={false}
/>
```

### With APY Badge
```tsx
<ThumbSlider
  value={percentage}
  onChange={setPercentage}
  badge={<span>5.25% APY</span>}
/>
```

### Custom Quick Buttons
```tsx
<ThumbSlider
  value={risk}
  onChange={setRisk}
  quickPercentages={[
    { value: 10, label: 'Low' },
    { value: 40, label: 'Medium' },
    { value: 80, label: 'High' },
    { value: 100, label: 'Maximum' }
  ]}
/>
```

### Minimal Slider (No Quick Buttons)
```tsx
<ThumbSlider
  value={value}
  onChange={setValue}
  showQuickButtons={false}
/>
```

### Disabled State
```tsx
<ThumbSlider
  value={75}
  onChange={() => {}}
  disabled={true}
  badge={<span>Locked</span>}
/>
```

## Types

```tsx
interface QuickPercentage {
  value: number;
  label: string;
}

interface ThumbSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showPercentage?: boolean;
  showQuickButtons?: boolean;
  quickPercentages?: QuickPercentage[];
  badge?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}
```

## Styling

The component uses CSS modules and supports CSS custom properties:

- `--primary-color`: Primary theme color
- `--secondary-color`: Secondary theme color  
- `--surface-medium`: Background for track
- `--border-color`: Border colors
- `--text-primary`: Primary text color
- `--text-secondary`: Secondary text color

Light theme is automatically supported via `[data-theme="light"]` selectors.

## Integration with Existing Code

To replace the slider in `DepositForm.tsx`:

```tsx
// Replace the existing slider implementation with:
<ThumbSlider
  value={percentage}
  onChange={(newPercentage) => {
    setPercentage(newPercentage);
    const calculatedAmount = (maxAmount * newPercentage / 100).toFixed(6);
    setAmount(calculatedAmount);
    setActivePercentage(null);
  }}
  badge={<span>{yieldOption.apy.toFixed(2)}% APY</span>}
/>
``` 