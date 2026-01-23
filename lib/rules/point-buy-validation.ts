/**
 * D&D 5e Point Buy Validation
 * Validates point buy ability score assignments
 */

import type { AbilityScores, ValidationResult, ValidationError } from './types';

// Standard Point Buy configuration per D&D 5e SRD
export const POINT_BUY_CONFIG = {
  totalPoints: 27,
  minScore: 8,
  maxScore: 15,
  costs: {
    8: 0,
    9: 1,
    10: 2,
    11: 3,
    12: 4,
    13: 5,
    14: 7,
    15: 9,
  } as Record<number, number>,
};

/**
 * Calculate the point cost for a single ability score
 */
export function getPointCost(score: number): number {
  if (score < POINT_BUY_CONFIG.minScore || score > POINT_BUY_CONFIG.maxScore) {
    return -1; // Invalid score for point buy
  }
  return POINT_BUY_CONFIG.costs[score] ?? -1;
}

/**
 * Calculate total points spent on all ability scores
 */
export function calculateTotalPointsSpent(abilityScores: AbilityScores): number {
  let total = 0;
  const abilities: (keyof AbilityScores)[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
  
  for (const ability of abilities) {
    const cost = getPointCost(abilityScores[ability]);
    if (cost === -1) {
      // If any score is invalid, return -1 to indicate error
      return -1;
    }
    total += cost;
  }
  
  return total;
}

/**
 * Validate a single ability score for point buy
 */
export function validatePointBuyScore(
  ability: keyof AbilityScores,
  score: number
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!Number.isInteger(score)) {
    errors.push({
      code: 'POINT_BUY_NOT_INTEGER',
      message: `${ability.toUpperCase()} must be a whole number`,
      severity: 'error',
      field: `abilityScores.${ability}`,
    });
    return { isValid: false, errors, warnings };
  }

  if (score < POINT_BUY_CONFIG.minScore) {
    errors.push({
      code: 'POINT_BUY_SCORE_TOO_LOW',
      message: `${ability.toUpperCase()} cannot be lower than ${POINT_BUY_CONFIG.minScore} in point buy`,
      severity: 'error',
      field: `abilityScores.${ability}`,
      suggestion: `Minimum ability score in point buy is ${POINT_BUY_CONFIG.minScore}`,
    });
  }

  if (score > POINT_BUY_CONFIG.maxScore) {
    errors.push({
      code: 'POINT_BUY_SCORE_TOO_HIGH',
      message: `${ability.toUpperCase()} cannot exceed ${POINT_BUY_CONFIG.maxScore} in point buy`,
      severity: 'error',
      field: `abilityScores.${ability}`,
      suggestion: `Maximum ability score in point buy is ${POINT_BUY_CONFIG.maxScore} (before racial bonuses)`,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate all ability scores for point buy method
 */
export function validatePointBuyScores(abilityScores: AbilityScores): ValidationResult {
  const allErrors: ValidationError[] = [];
  const allWarnings: ValidationError[] = [];

  const abilities: (keyof AbilityScores)[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

  // First, validate individual scores
  for (const ability of abilities) {
    const result = validatePointBuyScore(ability, abilityScores[ability]);
    allErrors.push(...result.errors);
    allWarnings.push(...result.warnings);
  }

  // If individual scores are valid, check total points
  if (allErrors.length === 0) {
    const totalSpent = calculateTotalPointsSpent(abilityScores);
    
    if (totalSpent > POINT_BUY_CONFIG.totalPoints) {
      const excess = totalSpent - POINT_BUY_CONFIG.totalPoints;
      allErrors.push({
        code: 'POINT_BUY_EXCEEDED',
        message: `You've spent ${totalSpent} points, but only ${POINT_BUY_CONFIG.totalPoints} are available. You're ${excess} point${excess > 1 ? 's' : ''} over.`,
        severity: 'error',
        field: 'abilityScores',
        suggestion: `Reduce some ability scores to free up ${excess} point${excess > 1 ? 's' : ''}`,
      });
    } else if (totalSpent < POINT_BUY_CONFIG.totalPoints) {
      const remaining = POINT_BUY_CONFIG.totalPoints - totalSpent;
      allWarnings.push({
        code: 'POINT_BUY_POINTS_REMAINING',
        message: `You have ${remaining} point${remaining > 1 ? 's' : ''} left to spend`,
        severity: 'info',
        field: 'abilityScores',
      });
    }
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}

/**
 * Check if an ability score can be increased within point buy rules
 */
export function canIncreaseScore(
  currentScore: number,
  currentTotalSpent: number
): { canIncrease: boolean; reason?: string } {
  if (currentScore >= POINT_BUY_CONFIG.maxScore) {
    return { 
      canIncrease: false, 
      reason: `Maximum score of ${POINT_BUY_CONFIG.maxScore} reached` 
    };
  }

  const currentCost = getPointCost(currentScore);
  const nextCost = getPointCost(currentScore + 1);
  
  if (nextCost === -1) {
    return { canIncrease: false, reason: 'Invalid score' };
  }

  const pointsNeeded = nextCost - currentCost;
  const pointsAvailable = POINT_BUY_CONFIG.totalPoints - currentTotalSpent;

  if (pointsNeeded > pointsAvailable) {
    return { 
      canIncrease: false, 
      reason: `Need ${pointsNeeded} point${pointsNeeded > 1 ? 's' : ''}, but only ${pointsAvailable} available` 
    };
  }

  return { canIncrease: true };
}

/**
 * Check if an ability score can be decreased within point buy rules
 */
export function canDecreaseScore(currentScore: number): { canDecrease: boolean; reason?: string } {
  if (currentScore <= POINT_BUY_CONFIG.minScore) {
    return { 
      canDecrease: false, 
      reason: `Minimum score of ${POINT_BUY_CONFIG.minScore} reached` 
    };
  }

  return { canDecrease: true };
}

/**
 * Get the points that would be freed by decreasing a score
 */
export function getPointsFreedByDecrease(currentScore: number): number {
  if (currentScore <= POINT_BUY_CONFIG.minScore) {
    return 0;
  }

  const currentCost = getPointCost(currentScore);
  const lowerCost = getPointCost(currentScore - 1);
  
  if (currentCost === -1 || lowerCost === -1) {
    return 0;
  }

  return currentCost - lowerCost;
}

/**
 * Get point buy summary
 */
export function getPointBuySummary(abilityScores: AbilityScores): {
  totalSpent: number;
  remaining: number;
  breakdown: Record<keyof AbilityScores, number>;
  isValid: boolean;
} {
  const abilities: (keyof AbilityScores)[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
  const breakdown: Record<string, number> = {};
  let totalSpent = 0;
  let isValid = true;

  for (const ability of abilities) {
    const cost = getPointCost(abilityScores[ability]);
    if (cost === -1) {
      isValid = false;
      breakdown[ability] = 0;
    } else {
      breakdown[ability] = cost;
      totalSpent += cost;
    }
  }

  if (totalSpent > POINT_BUY_CONFIG.totalPoints) {
    isValid = false;
  }

  return {
    totalSpent,
    remaining: POINT_BUY_CONFIG.totalPoints - totalSpent,
    breakdown: breakdown as Record<keyof AbilityScores, number>,
    isValid,
  };
}
