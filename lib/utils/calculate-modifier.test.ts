import { describe, it, expect } from 'vitest';
import { calculateModifier } from './calculate-modifier';

describe('calculateModifier', () => {
  it('modifies 10 to 0', () => {
    expect(calculateModifier(10)).toBe(0);
  });

  it('modifies 8 to -1', () => {
    expect(calculateModifier(8)).toBe(-1);
  });

  it('modifies 20 to 5', () => {
    expect(calculateModifier(20)).toBe(5);
  });

  it('modifies 1 to -5', () => {
    expect(calculateModifier(1)).toBe(-5);
  });
});
