import { describe, it, expect } from 'vitest';
import { calculateModifier } from '@/lib/utils/calculate-modifier';
import { calculatePointBuyCost, getTotalPointsSpent } from '@/lib/utils/ability-score-rules';

describe('Ability Score Rules', () => {
  it('calculates modifiers correctly', () => {
    expect(calculateModifier(10)).toBe(0);
    expect(calculateModifier(12)).toBe(1);
    expect(calculateModifier(8)).toBe(-1);
    expect(calculateModifier(18)).toBe(4);
    expect(calculateModifier(1)).toBe(-5);
  });

  it('calculates point buy cost', () => {
    expect(calculatePointBuyCost(8)).toBe(0);
    expect(calculatePointBuyCost(10)).toBe(2);
    expect(calculatePointBuyCost(15)).toBe(9);
    expect(calculatePointBuyCost(16)).toBe(0); // Only handled up to 15 in table
  });

  it('calculates total spent', () => {
     const scores = { str: 8, dex: 10, con: 12, int: 13, wis: 14, cha: 15 };
     // 0 + 2 + 4 + 5 + 7 + 9 = 27
     expect(getTotalPointsSpent(scores)).toBe(27);
  });
});
