/**
 * D&D 5e Multiclassing Prerequisites
 * Based on SRD 5.1 rules
 */

import type { MulticlassRequirement, AbilityScores, ValidationResult, ValidationError } from './types';

// Multiclass prerequisites per class (SRD 5.1)
export const MULTICLASS_PREREQUISITES: MulticlassRequirement[] = [
  {
    className: 'Barbarian',
    requirements: [{ ability: 'str', minimum: 13 }],
    requirementType: 'all',
  },
  {
    className: 'Bard',
    requirements: [{ ability: 'cha', minimum: 13 }],
    requirementType: 'all',
  },
  {
    className: 'Cleric',
    requirements: [{ ability: 'wis', minimum: 13 }],
    requirementType: 'all',
  },
  {
    className: 'Druid',
    requirements: [{ ability: 'wis', minimum: 13 }],
    requirementType: 'all',
  },
  {
    className: 'Fighter',
    requirements: [
      { ability: 'str', minimum: 13 },
      { ability: 'dex', minimum: 13 },
    ],
    requirementType: 'any', // Fighter can meet STR OR DEX
  },
  {
    className: 'Monk',
    requirements: [
      { ability: 'dex', minimum: 13 },
      { ability: 'wis', minimum: 13 },
    ],
    requirementType: 'all',
  },
  {
    className: 'Paladin',
    requirements: [
      { ability: 'str', minimum: 13 },
      { ability: 'cha', minimum: 13 },
    ],
    requirementType: 'all',
  },
  {
    className: 'Ranger',
    requirements: [
      { ability: 'dex', minimum: 13 },
      { ability: 'wis', minimum: 13 },
    ],
    requirementType: 'all',
  },
  {
    className: 'Rogue',
    requirements: [{ ability: 'dex', minimum: 13 }],
    requirementType: 'all',
  },
  {
    className: 'Sorcerer',
    requirements: [{ ability: 'cha', minimum: 13 }],
    requirementType: 'all',
  },
  {
    className: 'Warlock',
    requirements: [{ ability: 'cha', minimum: 13 }],
    requirementType: 'all',
  },
  {
    className: 'Wizard',
    requirements: [{ ability: 'int', minimum: 13 }],
    requirementType: 'all',
  },
];

/**
 * Get the multiclass prerequisite for a specific class
 */
export function getMulticlassPrerequisite(className: string): MulticlassRequirement | undefined {
  return MULTICLASS_PREREQUISITES.find(
    (req) => req.className.toLowerCase() === className.toLowerCase()
  );
}

/**
 * Check if ability scores meet multiclass prerequisites for a specific class
 */
export function checkMulticlassPrerequisites(
  className: string,
  abilityScores: AbilityScores
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  
  const prerequisite = getMulticlassPrerequisite(className);
  
  if (!prerequisite) {
    // Unknown class - can't validate
    warnings.push({
      code: 'MULTICLASS_UNKNOWN_CLASS',
      message: `Unknown class "${className}" - cannot validate multiclass prerequisites`,
      severity: 'warning',
      field: 'class',
    });
    return { isValid: true, errors, warnings };
  }

  const { requirements, requirementType } = prerequisite;
  
  if (requirementType === 'all') {
    // Must meet ALL requirements
    for (const req of requirements) {
      const score = abilityScores[req.ability];
      if (score < req.minimum) {
        errors.push({
          code: 'MULTICLASS_PREREQ_NOT_MET',
          message: `Multiclassing into ${className} requires ${req.ability.toUpperCase()} ${req.minimum} or higher. Your ${req.ability.toUpperCase()} is ${score}.`,
          severity: 'error',
          field: `abilityScores.${req.ability}`,
          suggestion: `Increase ${req.ability.toUpperCase()} to at least ${req.minimum}`,
        });
      }
    }
  } else {
    // Must meet ANY requirement (e.g., Fighter: STR 13 OR DEX 13)
    const meetsAny = requirements.some(
      (req) => abilityScores[req.ability] >= req.minimum
    );
    
    if (!meetsAny) {
      const reqStrings = requirements.map(
        (req) => `${req.ability.toUpperCase()} ${req.minimum}`
      );
      errors.push({
        code: 'MULTICLASS_PREREQ_NOT_MET',
        message: `Multiclassing into ${className} requires one of: ${reqStrings.join(' or ')}. None of these are met.`,
        severity: 'error',
        field: 'abilityScores',
        suggestion: `Increase one of ${reqStrings.join(' or ')} to meet the requirement`,
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Check if a character can multiclass from their current class(es) to a new class
 * This validates both that they can leave their current class(es) AND enter the new one
 */
export function canMulticlass(
  currentClasses: string[],
  targetClass: string,
  abilityScores: AbilityScores
): ValidationResult {
  const allErrors: ValidationError[] = [];
  const allWarnings: ValidationError[] = [];

  // Rule: To multiclass, you must meet the prerequisites of BOTH your current class AND your new class
  // (This is per RAW D&D 5e rules)
  
  // Check prerequisites for current class(es)
  for (const currentClass of currentClasses) {
    const result = checkMulticlassPrerequisites(currentClass, abilityScores);
    if (!result.isValid) {
      // Modify error message to clarify this is for leaving the class
      for (const error of result.errors) {
        allErrors.push({
          ...error,
          message: `To multiclass out of ${currentClass}: ${error.message}`,
        });
      }
    }
    allWarnings.push(...result.warnings);
  }

  // Check prerequisites for target class
  const targetResult = checkMulticlassPrerequisites(targetClass, abilityScores);
  allErrors.push(...targetResult.errors);
  allWarnings.push(...targetResult.warnings);

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}

/**
 * Get a human-readable description of multiclass prerequisites for a class
 */
export function getMulticlassPrerequisiteDescription(className: string): string {
  const prerequisite = getMulticlassPrerequisite(className);
  
  if (!prerequisite) {
    return 'Unknown class prerequisites';
  }

  const { requirements, requirementType } = prerequisite;
  const reqStrings = requirements.map(
    (req) => `${req.ability.toUpperCase()} ${req.minimum}`
  );

  if (requirementType === 'all') {
    return reqStrings.join(' and ');
  } else {
    return reqStrings.join(' or ');
  }
}
