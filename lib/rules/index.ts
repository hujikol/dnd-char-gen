/**
 * D&D 5e Rules Validation Engine
 * Main entry point for all character validation
 */

// Re-export all types
export * from './types';

// Re-export all validation modules
export * from './multiclass-prerequisites';
export * from './ability-score-validation';
export * from './spell-filtering';
export * from './feat-prerequisites';
export * from './spells-known-validation';
export * from './equipment-proficiency';
export * from './point-buy-validation';
export * from './validation-feedback';

// Import for internal use
import type { 
  CharacterForValidation, 
  ValidationResult, 
  ValidationError,
  AbilityScores 
} from './types';

import { checkMulticlassPrerequisites, canMulticlass } from './multiclass-prerequisites';
import { validateAllAbilityScores } from './ability-score-validation';
import { validateSpellSelection, filterSpellsByClassAndLevel, getMaxSpellLevel } from './spell-filtering';
import { validateFeatPrerequisites, getAvailableFeats } from './feat-prerequisites';
import { validateKnownSpellsLimit, validatePreparedSpellsLimit } from './spells-known-validation';
import { validateAllEquippedItems } from './equipment-proficiency';
import { validatePointBuyScores } from './point-buy-validation';
import { mergeValidationResults, createEmptyValidationResult } from './validation-feedback';

/**
 * Comprehensive character validation
 * Runs all applicable validations based on character state
 */
export function validateCharacter(character: CharacterForValidation): ValidationResult {
  const results: ValidationResult[] = [];

  // 1. Validate ability scores
  results.push(validateAllAbilityScores(character.abilityScores));

  // 2. Validate point buy if that method is selected
  if (character.abilityScoreMethod === 'point-buy') {
    results.push(validatePointBuyScores(character.abilityScores));
  }

  // 3. Validate multiclass prerequisites if character has multiple classes
  if (character.classes.length > 1) {
    for (const charClass of character.classes) {
      results.push(
        checkMulticlassPrerequisites(charClass.name, character.abilityScores)
      );
    }
  }

  // 4. Validate equipped items
  if (character.equippedItems && character.equippedItems.length > 0) {
    const classNames = character.classes.map((c) => c.name);
    results.push(
      validateAllEquippedItems(
        character.equippedItems,
        classNames,
        character.proficiencies
      )
    );
  }

  // 5. Validate feats
  if (character.feats && character.feats.length > 0) {
    for (const featName of character.feats) {
      results.push(validateFeatPrerequisites(featName, character));
    }
  }

  return mergeValidationResults(...results);
}

/**
 * Quick validation for ability score changes
 * Lighter weight than full character validation
 */
export function validateAbilityScoreChange(
  abilityScores: AbilityScores,
  method: 'point-buy' | 'standard-array' | 'manual',
  currentClasses?: string[]
): ValidationResult {
  const results: ValidationResult[] = [];

  // Basic ability score validation
  results.push(validateAllAbilityScores(abilityScores));

  // Method-specific validation
  if (method === 'point-buy') {
    results.push(validatePointBuyScores(abilityScores));
  }

  // Multiclass prerequisite check if applicable
  if (currentClasses && currentClasses.length > 0) {
    for (const className of currentClasses) {
      results.push(checkMulticlassPrerequisites(className, abilityScores));
    }
  }

  return mergeValidationResults(...results);
}

/**
 * Validate ability to add a new class (multiclassing)
 */
export function validateMulticlassAddition(
  character: CharacterForValidation,
  newClassName: string
): ValidationResult {
  const currentClassNames = character.classes.map((c) => c.name);
  
  // Check if already has this class
  if (currentClassNames.some((c) => c.toLowerCase() === newClassName.toLowerCase())) {
    return createEmptyValidationResult(); // Already has class, just leveling up
  }

  return canMulticlass(currentClassNames, newClassName, character.abilityScores);
}

/**
 * Get validation status for UI indicators
 */
export function getValidationStatus(result: ValidationResult): {
  status: 'valid' | 'warning' | 'error';
  message: string;
  count: number;
} {
  if (!result.isValid) {
    return {
      status: 'error',
      message: result.errors[0]?.message || 'Validation errors found',
      count: result.errors.length,
    };
  }

  if (result.warnings.length > 0) {
    const warningsOnly = result.warnings.filter((w) => w.severity === 'warning');
    if (warningsOnly.length > 0) {
      return {
        status: 'warning',
        message: warningsOnly[0]?.message || 'Warnings found',
        count: warningsOnly.length,
      };
    }
  }

  return {
    status: 'valid',
    message: 'All validations passed',
    count: 0,
  };
}

/**
 * Validate a single field and return real-time feedback
 */
export function validateField(
  fieldName: string,
  value: unknown,
  context: Partial<CharacterForValidation>
): ValidationResult {
  switch (fieldName) {
    case 'abilityScores':
      return validateAllAbilityScores(value as AbilityScores);
    
    case 'str':
    case 'dex':
    case 'con':
    case 'int':
    case 'wis':
    case 'cha':
      // Single ability score validation
      const scores: AbilityScores = {
        ...{ str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
        ...(context.abilityScores || {}),
        [fieldName]: value as number,
      };
      return validateAllAbilityScores(scores);
    
    default:
      return createEmptyValidationResult();
  }
}

/**
 * Get spell options for a character
 */
export function getSpellOptions(
  className: string,
  level: number,
  allSpells: { name: string; level: number; classes: string[]; school: string; castingTime: string; range: string; components: string; duration: string; description: string }[]
) {
  const maxLevel = getMaxSpellLevel(className, level);
  const availableSpells = filterSpellsByClassAndLevel(allSpells, className, level);
  
  return {
    maxSpellLevel: maxLevel,
    availableSpells,
    cantrips: availableSpells.filter((s) => s.level === 0),
    spellsByLevel: Object.fromEntries(
      Array.from({ length: 9 }, (_, i) => i + 1).map((lvl) => [
        lvl,
        availableSpells.filter((s) => s.level === lvl),
      ])
    ),
  };
}

/**
 * Get feat options for a character
 */
export function getFeatOptions(character: CharacterForValidation) {
  const available = getAvailableFeats(character);
  const alreadyTaken = character.feats || [];
  
  return {
    available: available.filter((f) => !alreadyTaken.includes(f.name)),
    alreadyTaken: available.filter((f) => alreadyTaken.includes(f.name)),
  };
}
