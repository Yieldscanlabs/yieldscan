export interface QuickPercentage {
  value: number;
  label: string;
}

export interface ThumbSliderProps {
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