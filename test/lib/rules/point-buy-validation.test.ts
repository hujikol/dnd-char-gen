import { describe, it, expect } from 'vitest';
import {
  validatePointBuyScore,
  validatePointBuyScores,
  calculateTotalPointsSpent,
  getPointCost,
  canIncreaseScore,
  canDecreaseScore,
  getPointBuySummary,
  POINT_BUY_CONFIG,
} from '@/lib/rules/point-buy-validation';
import type { AbilityScores } from '@/lib/rules/types';

describe('Point Buy Validation', () => {
  describe('getPointCost', () => {
    it('should return correct cost for valid scores', () => {
      expect(getPointCost(8)).toBe(0);
      expect(getPointCost(10)).toBe(2);
      expect(getPointCost(13)).toBe(5);
      expect(getPointCost(14)).toBe(7);
      expect(getPointCost(15)).toBe(9);
    });

    it('should return -1 for invalid scores', () => {
      expect(getPointCost(7)).toBe(-1);
      expect(getPointCost(16)).toBe(-1);
    });
  });

  describe('calculateTotalPointsSpent', () => {
    it('should calculate total points for valid scores', () => {
      const scores: AbilityScores = { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 };
      expect(calculateTotalPointsSpent(scores)).toBe(0);
    });

    it('should return -1 if any score is invalid', () => {
      const scores: AbilityScores = { str: 16, dex: 8, con: 8, int: 8, wis: 8, cha: 8 };
      expect(calculateTotalPointsSpent(scores)).toBe(-1);
    });

    it('should calculate 27 points for standard balanced allocation', () => {
      // 15, 14, 13, 12, 10, 8 = 9 + 7 + 5 + 4 + 2 + 0 = 27
      const scores: AbilityScores = { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 };
      expect(calculateTotalPointsSpent(scores)).toBe(27);
    });
  });

  describe('validatePointBuyScore', () => {
    it('should pass for valid scores', () => {
      const result = validatePointBuyScore('str', 10);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail for scores below minimum', () => {
      const result = validatePointBuyScore('str', 7);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('POINT_BUY_SCORE_TOO_LOW');
    });

    it('should fail for scores above maximum', () => {
      const result = validatePointBuyScore('str', 16);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('POINT_BUY_SCORE_TOO_HIGH');
    });

    it('should fail for non-integer scores', () => {
      const result = validatePointBuyScore('str', 10.5);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('POINT_BUY_NOT_INTEGER');
    });
  });

  describe('validatePointBuyScores', () => {
    it('should pass for valid allocation within budget', () => {
      const scores: AbilityScores = { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 };
      const result = validatePointBuyScores(scores);
      expect(result.isValid).toBe(true);
    });

    it('should fail when exceeding point budget', () => {
      const scores: AbilityScores = { str: 15, dex: 15, con: 15, int: 10, wis: 10, cha: 8 };
      const result = validatePointBuyScores(scores);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('POINT_BUY_EXCEEDED');
    });

    it('should warn when points remain', () => {
      const scores: AbilityScores = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
      const result = validatePointBuyScores(scores);
      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.code === 'POINT_BUY_POINTS_REMAINING')).toBe(true);
    });
  });

  describe('canIncreaseScore', () => {
    it('should return true when can increase', () => {
      const result = canIncreaseScore(10, 10); // 10 points spent, need 1 more for 11
      expect(result.canIncrease).toBe(true);
    });

    it('should return false when at max score', () => {
      const result = canIncreaseScore(15, 0);
      expect(result.canIncrease).toBe(false);
      expect(result.reason).toContain('Maximum');
    });

    it('should return false when not enough points', () => {
      const result = canIncreaseScore(14, 26); // 26 spent, need 2 more for 15
      expect(result.canIncrease).toBe(false);
      expect(result.reason).toContain('point');
    });
  });

  describe('canDecreaseScore', () => {
    it('should return true when can decrease', () => {
      const result = canDecreaseScore(10);
      expect(result.canDecrease).toBe(true);
    });

    it('should return false when at min score', () => {
      const result = canDecreaseScore(8);
      expect(result.canDecrease).toBe(false);
      expect(result.reason).toContain('Minimum');
    });
  });

  describe('getPointBuySummary', () => {
    it('should return correct summary', () => {
      const scores: AbilityScores = { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 };
      const summary = getPointBuySummary(scores);
      
      expect(summary.totalSpent).toBe(27);
      expect(summary.remaining).toBe(0);
      expect(summary.isValid).toBe(true);
      expect(summary.breakdown.str).toBe(9);
      expect(summary.breakdown.dex).toBe(7);
    });
  });
});
