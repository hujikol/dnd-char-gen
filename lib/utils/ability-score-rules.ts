export const ABILITY_SCORES = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;
export type Ability = typeof ABILITY_SCORES[number];

export const POINT_BUY_COSTS: Record<number, number> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

export function calculatePointBuyCost(score: number): number {
  return POINT_BUY_COSTS[score] ?? 0;
}

export function getTotalPointsSpent(scores: Record<string, number>): number {
  return Object.values(scores).reduce((total, score) => total + calculatePointBuyCost(score), 0);
}
