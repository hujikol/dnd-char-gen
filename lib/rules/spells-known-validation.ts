/**
 * D&D 5e Known Spells Limit Validation
 * Validates that characters don't exceed their class's spell limits
 */

import type { ValidationResult, ValidationError } from './types';
import { CLASS_CASTER_TYPES, FULL_CASTER_SPELL_SLOTS, HALF_CASTER_SPELL_SLOTS } from './spell-filtering';

// Spells known by class and level (for classes that track spells known)
export const SPELLS_KNOWN: Record<string, Record<number, number>> = {
  Bard: {
    1: 4, 2: 5, 3: 6, 4: 7, 5: 8, 6: 9, 7: 10, 8: 11, 9: 12, 10: 14,
    11: 15, 12: 15, 13: 16, 14: 18, 15: 19, 16: 19, 17: 20, 18: 22, 19: 22, 20: 22
  },
  Ranger: {
    1: 0, 2: 2, 3: 3, 4: 3, 5: 4, 6: 4, 7: 5, 8: 5, 9: 6, 10: 6,
    11: 7, 12: 7, 13: 8, 14: 8, 15: 9, 16: 9, 17: 10, 18: 10, 19: 11, 20: 11
  },
  Sorcerer: {
    1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 11,
    11: 12, 12: 12, 13: 13, 14: 13, 15: 14, 16: 14, 17: 15, 18: 15, 19: 15, 20: 15
  },
  Warlock: {
    1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 10,
    11: 11, 12: 11, 13: 12, 14: 12, 15: 13, 16: 13, 17: 14, 18: 14, 19: 15, 20: 15
  },
};

// Cantrips known by class and level
export const CANTRIPS_KNOWN: Record<string, Record<number, number>> = {
  Bard: {
    1: 2, 2: 2, 3: 2, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3, 10: 4,
    11: 4, 12: 4, 13: 4, 14: 4, 15: 4, 16: 4, 17: 4, 18: 4, 19: 4, 20: 4
  },
  Cleric: {
    1: 3, 2: 3, 3: 3, 4: 4, 5: 4, 6: 4, 7: 4, 8: 4, 9: 4, 10: 5,
    11: 5, 12: 5, 13: 5, 14: 5, 15: 5, 16: 5, 17: 5, 18: 5, 19: 5, 20: 5
  },
  Druid: {
    1: 2, 2: 2, 3: 2, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3, 10: 4,
    11: 4, 12: 4, 13: 4, 14: 4, 15: 4, 16: 4, 17: 4, 18: 4, 19: 4, 20: 4
  },
  Sorcerer: {
    1: 4, 2: 4, 3: 4, 4: 5, 5: 5, 6: 5, 7: 5, 8: 5, 9: 5, 10: 6,
    11: 6, 12: 6, 13: 6, 14: 6, 15: 6, 16: 6, 17: 6, 18: 6, 19: 6, 20: 6
  },
  Warlock: {
    1: 2, 2: 2, 3: 2, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3, 10: 4,
    11: 4, 12: 4, 13: 4, 14: 4, 15: 4, 16: 4, 17: 4, 18: 4, 19: 4, 20: 4
  },
  Wizard: {
    1: 3, 2: 3, 3: 3, 4: 4, 5: 4, 6: 4, 7: 4, 8: 4, 9: 4, 10: 5,
    11: 5, 12: 5, 13: 5, 14: 5, 15: 5, 16: 5, 17: 5, 18: 5, 19: 5, 20: 5
  },
};

// Classes that prepare spells (instead of tracking spells known)
export const PREPARED_SPELL_CLASSES = ['Cleric', 'Druid', 'Paladin', 'Wizard'];

/**
 * Check if a class uses prepared spells
 */
export function usesPreparedSpells(className: string): boolean {
  return PREPARED_SPELL_CLASSES.some(
    (c) => c.toLowerCase() === className.toLowerCase()
  );
}

/**
 * Get the number of spells known for a class at a level
 */
export function getSpellsKnownLimit(className: string, level: number): number | null {
  // Prepared spell casters don't have a "spells known" limit in the same way
  if (usesPreparedSpells(className)) {
    return null;
  }
  
  const classSpells = SPELLS_KNOWN[className];
  if (!classSpells) {
    return null;
  }
  
  return classSpells[level] || 0;
}

/**
 * Get the number of cantrips known for a class at a level
 */
export function getCantripsKnownLimit(className: string, level: number): number {
  const classCantrips = CANTRIPS_KNOWN[className];
  if (!classCantrips) {
    return 0;
  }
  
  return classCantrips[level] || 0;
}

/**
 * Calculate how many spells a prepared caster can prepare
 */
export function getPreparedSpellsLimit(
  className: string,
  level: number,
  abilityModifier: number
): number {
  if (!usesPreparedSpells(className)) {
    return 0;
  }
  
  // Formula: ability modifier + level (minimum of 1)
  // For Paladins and Rangers, they use half their level (rounded down)
  const casterType = CLASS_CASTER_TYPES[className];
  
  if (casterType === 'half') {
    // Half-casters prepare spells = ability mod + half level
    return Math.max(1, abilityModifier + Math.floor(level / 2));
  }
  
  // Full casters prepare spells = ability mod + level
  return Math.max(1, abilityModifier + level);
}

/**
 * Validate the number of known spells for a character
 */
export function validateKnownSpellsLimit(
  className: string,
  level: number,
  knownSpells: string[],
  knownCantrips: string[]
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  
  // Check spells known limit
  const spellsLimit = getSpellsKnownLimit(className, level);
  
  if (spellsLimit !== null) {
    if (knownSpells.length > spellsLimit) {
      const excess = knownSpells.length - spellsLimit;
      errors.push({
        code: 'TOO_MANY_SPELLS_KNOWN',
        message: `You know ${knownSpells.length} spells, but a level ${level} ${className} can only know ${spellsLimit} spells. Remove ${excess} spell${excess > 1 ? 's' : ''}.`,
        severity: 'error',
        field: 'knownSpells',
        suggestion: `Remove ${excess} spell${excess > 1 ? 's' : ''} from your known spells`,
      });
    } else if (knownSpells.length < spellsLimit) {
      const remaining = spellsLimit - knownSpells.length;
      warnings.push({
        code: 'SPELLS_KNOWN_AVAILABLE',
        message: `You can know ${remaining} more spell${remaining > 1 ? 's' : ''}`,
        severity: 'info',
        field: 'knownSpells',
      });
    }
  }
  
  // Check cantrips known limit
  const cantripsLimit = getCantripsKnownLimit(className, level);
  
  if (cantripsLimit > 0) {
    if (knownCantrips.length > cantripsLimit) {
      const excess = knownCantrips.length - cantripsLimit;
      errors.push({
        code: 'TOO_MANY_CANTRIPS_KNOWN',
        message: `You know ${knownCantrips.length} cantrips, but a level ${level} ${className} can only know ${cantripsLimit}. Remove ${excess} cantrip${excess > 1 ? 's' : ''}.`,
        severity: 'error',
        field: 'knownCantrips',
        suggestion: `Remove ${excess} cantrip${excess > 1 ? 's' : ''} from your known cantrips`,
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
 * Validate prepared spells limit for prepared casters
 */
export function validatePreparedSpellsLimit(
  className: string,
  level: number,
  abilityModifier: number,
  preparedSpells: string[]
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  
  if (!usesPreparedSpells(className)) {
    return { isValid: true, errors, warnings };
  }
  
  const limit = getPreparedSpellsLimit(className, level, abilityModifier);
  
  if (preparedSpells.length > limit) {
    const excess = preparedSpells.length - limit;
    errors.push({
      code: 'TOO_MANY_PREPARED_SPELLS',
      message: `You have ${preparedSpells.length} spells prepared, but can only prepare ${limit}. Unprepare ${excess} spell${excess > 1 ? 's' : ''}.`,
      severity: 'error',
      field: 'preparedSpells',
      suggestion: `Unprepare ${excess} spell${excess > 1 ? 's' : ''}`,
    });
  } else if (preparedSpells.length < limit) {
    const remaining = limit - preparedSpells.length;
    warnings.push({
      code: 'CAN_PREPARE_MORE_SPELLS',
      message: `You can prepare ${remaining} more spell${remaining > 1 ? 's' : ''}`,
      severity: 'info',
      field: 'preparedSpells',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
