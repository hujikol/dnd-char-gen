/**
 * D&D 5e Spell List Filtering
 * Filters spells by class and level according to SRD rules
 */

import type { Spell, ValidationResult, ValidationError } from './types';

// Spell slot progression by class level (SRD full casters)
export const FULL_CASTER_SPELL_SLOTS: Record<number, number[]> = {
  1:  [2],
  2:  [3],
  3:  [4, 2],
  4:  [4, 3],
  5:  [4, 3, 2],
  6:  [4, 3, 3],
  7:  [4, 3, 3, 1],
  8:  [4, 3, 3, 2],
  9:  [4, 3, 3, 3, 1],
  10: [4, 3, 3, 3, 2],
  11: [4, 3, 3, 3, 2, 1],
  12: [4, 3, 3, 3, 2, 1],
  13: [4, 3, 3, 3, 2, 1, 1],
  14: [4, 3, 3, 3, 2, 1, 1],
  15: [4, 3, 3, 3, 2, 1, 1, 1],
  16: [4, 3, 3, 3, 2, 1, 1, 1],
  17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
  18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
  19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
  20: [4, 3, 3, 3, 3, 2, 2, 1, 1],
};

// Half-caster spell slot progression (Paladin, Ranger)
export const HALF_CASTER_SPELL_SLOTS: Record<number, number[]> = {
  1:  [],
  2:  [2],
  3:  [3],
  4:  [3],
  5:  [4, 2],
  6:  [4, 2],
  7:  [4, 3],
  8:  [4, 3],
  9:  [4, 3, 2],
  10: [4, 3, 2],
  11: [4, 3, 3],
  12: [4, 3, 3],
  13: [4, 3, 3, 1],
  14: [4, 3, 3, 1],
  15: [4, 3, 3, 2],
  16: [4, 3, 3, 2],
  17: [4, 3, 3, 3, 1],
  18: [4, 3, 3, 3, 1],
  19: [4, 3, 3, 3, 2],
  20: [4, 3, 3, 3, 2],
};

// Warlock pact magic (different system)
export const WARLOCK_PACT_SLOTS: Record<number, { slots: number; level: number }> = {
  1:  { slots: 1, level: 1 },
  2:  { slots: 2, level: 1 },
  3:  { slots: 2, level: 2 },
  4:  { slots: 2, level: 2 },
  5:  { slots: 2, level: 3 },
  6:  { slots: 2, level: 3 },
  7:  { slots: 2, level: 4 },
  8:  { slots: 2, level: 4 },
  9:  { slots: 2, level: 5 },
  10: { slots: 2, level: 5 },
  11: { slots: 3, level: 5 },
  12: { slots: 3, level: 5 },
  13: { slots: 3, level: 5 },
  14: { slots: 3, level: 5 },
  15: { slots: 3, level: 5 },
  16: { slots: 3, level: 5 },
  17: { slots: 4, level: 5 },
  18: { slots: 4, level: 5 },
  19: { slots: 4, level: 5 },
  20: { slots: 4, level: 5 },
};

// Caster types by class
export type CasterType = 'full' | 'half' | 'third' | 'pact' | 'none';

export const CLASS_CASTER_TYPES: Record<string, CasterType> = {
  'Bard': 'full',
  'Cleric': 'full',
  'Druid': 'full',
  'Sorcerer': 'full',
  'Wizard': 'full',
  'Paladin': 'half',
  'Ranger': 'half',
  'Warlock': 'pact',
  'Fighter': 'third', // Eldritch Knight
  'Rogue': 'third',   // Arcane Trickster
  'Barbarian': 'none',
  'Monk': 'none',
};

/**
 * Get the maximum spell level a class can cast at a given character level
 */
export function getMaxSpellLevel(className: string, characterLevel: number): number {
  const casterType = CLASS_CASTER_TYPES[className] || 'none';
  
  if (casterType === 'none') {
    return 0;
  }
  
  if (casterType === 'pact') {
    // Warlock uses pact magic
    return WARLOCK_PACT_SLOTS[characterLevel]?.level || 0;
  }
  
  let slots: number[];
  
  if (casterType === 'full') {
    slots = FULL_CASTER_SPELL_SLOTS[characterLevel] || [];
  } else if (casterType === 'half') {
    slots = HALF_CASTER_SPELL_SLOTS[characterLevel] || [];
  } else {
    // Third casters (calculate as if half their level, rounded up, for spell level)
    const effectiveLevel = Math.ceil(characterLevel / 3);
    slots = HALF_CASTER_SPELL_SLOTS[effectiveLevel * 2] || [];
  }
  
  return slots.length;
}

/**
 * Check if a class can learn/cast a specific spell
 */
export function canClassCastSpell(className: string, spell: Spell): boolean {
  // Check if the spell is on the class's spell list
  return spell.classes.some(
    (spellClass) => spellClass.toLowerCase() === className.toLowerCase()
  );
}

/**
 * Filter spells by class and maximum spell level
 */
export function filterSpellsByClassAndLevel(
  spells: Spell[],
  className: string,
  characterLevel: number
): Spell[] {
  const maxSpellLevel = getMaxSpellLevel(className, characterLevel);
  
  return spells.filter((spell) => {
    // Cantrips (level 0) are always available if the class can cast them
    if (spell.level === 0) {
      return canClassCastSpell(className, spell);
    }
    
    // Check if spell is on class list AND character can cast that spell level
    return canClassCastSpell(className, spell) && spell.level <= maxSpellLevel;
  });
}

/**
 * Validate a spell selection for a character
 */
export function validateSpellSelection(
  spell: Spell,
  className: string,
  characterLevel: number
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  
  // Check if spell is on class list
  if (!canClassCastSpell(className, spell)) {
    errors.push({
      code: 'SPELL_NOT_ON_CLASS_LIST',
      message: `${spell.name} is not on the ${className} spell list`,
      severity: 'error',
      field: 'spells',
      suggestion: `${spell.name} is available to: ${spell.classes.join(', ')}`,
    });
  }
  
  // Check if character can cast this spell level
  const maxSpellLevel = getMaxSpellLevel(className, characterLevel);
  
  if (spell.level > 0 && spell.level > maxSpellLevel) {
    errors.push({
      code: 'SPELL_LEVEL_TOO_HIGH',
      message: `Cannot cast ${spell.name} (level ${spell.level}). Maximum spell level at level ${characterLevel} is ${maxSpellLevel}`,
      severity: 'error',
      field: 'spells',
      suggestion: `You need to be a higher level ${className} to cast this spell`,
    });
  }
  
  // Check if class is a non-caster
  const casterType = CLASS_CASTER_TYPES[className];
  if (casterType === 'none' && spell.level > 0) {
    errors.push({
      code: 'CLASS_CANNOT_CAST_SPELLS',
      message: `${className} cannot cast spells`,
      severity: 'error',
      field: 'class',
      suggestion: `Consider a spellcasting class like Wizard, Cleric, or Bard`,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get available spells for a character's class and level
 */
export function getAvailableSpells(
  allSpells: Spell[],
  className: string,
  characterLevel: number
): { cantrips: Spell[]; spellsByLevel: Record<number, Spell[]> } {
  const filteredSpells = filterSpellsByClassAndLevel(allSpells, className, characterLevel);
  
  const cantrips = filteredSpells.filter((s) => s.level === 0);
  const spellsByLevel: Record<number, Spell[]> = {};
  
  for (let level = 1; level <= 9; level++) {
    const spellsAtLevel = filteredSpells.filter((s) => s.level === level);
    if (spellsAtLevel.length > 0) {
      spellsByLevel[level] = spellsAtLevel;
    }
  }
  
  return { cantrips, spellsByLevel };
}
