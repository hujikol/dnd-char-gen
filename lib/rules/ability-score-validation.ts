/**
 * D&D 5e Ability Score Validation
 * Real-time validation for ability scores
 */

import type { AbilityScores, ValidationResult, ValidationError } from './types';

// Ability score constraints
export const ABILITY_SCORE_MIN = 1;
export const ABILITY_SCORE_MAX = 20; // Standard max without magic items
export const ABILITY_SCORE_ABSOLUTE_MAX = 30; // Absolute max per D&D 5e rules

/**
 * Validate a single ability score
 */
export function validateAbilityScore(
  ability: keyof AbilityScores,
  value: number
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!Number.isInteger(value)) {
    errors.push({
      code: 'ABILITY_SCORE_NOT_INTEGER',
      message: `${ability.toUpperCase()} must be a whole number`,
      severity: 'error',
      field: `abilityScores.${ability}`,
    });
  }

  if (value < ABILITY_SCORE_MIN) {
    errors.push({
      code: 'ABILITY_SCORE_TOO_LOW',
      message: `${ability.toUpperCase()} cannot be less than ${ABILITY_SCORE_MIN}`,
      severity: 'error',
      field: `abilityScores.${ability}`,
      suggestion: `Set ${ability.toUpperCase()} to at least ${ABILITY_SCORE_MIN}`,
    });
  }

  if (value > ABILITY_SCORE_ABSOLUTE_MAX) {
    errors.push({
      code: 'ABILITY_SCORE_TOO_HIGH',
      message: `${ability.toUpperCase()} cannot exceed ${ABILITY_SCORE_ABSOLUTE_MAX}`,
      severity: 'error',
      field: `abilityScores.${ability}`,
      suggestion: `The maximum ability score in D&D 5e is ${ABILITY_SCORE_ABSOLUTE_MAX}`,
    });
  }

  if (value > ABILITY_SCORE_MAX && value <= ABILITY_SCORE_ABSOLUTE_MAX) {
    warnings.push({
      code: 'ABILITY_SCORE_ABOVE_NORMAL_MAX',
      message: `${ability.toUpperCase()} of ${value} exceeds the normal maximum of ${ABILITY_SCORE_MAX}. This is only possible with magic items or special features.`,
      severity: 'warning',
      field: `abilityScores.${ability}`,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate all ability scores
 */
export function validateAllAbilityScores(
  abilityScores: AbilityScores
): ValidationResult {
  const allErrors: ValidationError[] = [];
  const allWarnings: ValidationError[] = [];

  const abilities: (keyof AbilityScores)[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

  for (const ability of abilities) {
    const result = validateAbilityScore(ability, abilityScores[ability]);
    allErrors.push(...result.errors);
    allWarnings.push(...result.warnings);
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}

/**
 * Check if ability scores meet a minimum threshold (used for prerequisites)
 */
export function meetsAbilityMinimum(
  abilityScores: AbilityScores,
  ability: keyof AbilityScores,
  minimum: number
): boolean {
  return abilityScores[ability] >= minimum;
}

/**
 * Get the ability modifier for a given score
 */
export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/**
 * Format an ability modifier for display (e.g., "+2" or "-1")
 */
export function formatModifier(modifier: number): string {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

/**
 * Validate ability scores for multiclass prerequisites
 * Returns warnings for abilities that are close to but don't meet requirements
 */
export function validateAbilityScoresForMulticlass(
  abilityScores: AbilityScores,
  targetClass: string,
  prerequisites: { ability: keyof AbilityScores; minimum: number }[]
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  for (const prereq of prerequisites) {
    const currentScore = abilityScores[prereq.ability];
    
    if (currentScore < prereq.minimum) {
      const difference = prereq.minimum - currentScore;
      
      errors.push({
        code: 'MULTICLASS_ABILITY_NOT_MET',
        message: `${prereq.ability.toUpperCase()} ${prereq.minimum} required for ${targetClass}. Current: ${currentScore} (need ${difference} more)`,
        severity: 'error',
        field: `abilityScores.${prereq.ability}`,
        suggestion: `Increase ${prereq.ability.toUpperCase()} by ${difference} to meet the requirement`,
      });
    } else if (currentScore === prereq.minimum) {
      // Exactly meeting the requirement - inform user
      warnings.push({
        code: 'MULTICLASS_ABILITY_AT_MINIMUM',
        message: `${prereq.ability.toUpperCase()} is exactly at the minimum (${prereq.minimum}) for ${targetClass}`,
        severity: 'info',
        field: `abilityScores.${prereq.ability}`,
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
