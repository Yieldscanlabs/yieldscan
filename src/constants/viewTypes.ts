// src/constants/viewTypes.ts
export const VIEW_TYPES = {
  CARDS: "cards",
  TABLE: "table",
} as const;

export type ViewType = (typeof VIEW_TYPES)[keyof typeof VIEW_TYPES];
