/**
 * D&D 5e Equipment Proficiency Validation
 * Validates equipment usage and warns about proficiency issues
 */

import type { 
  EquipmentItem, 
  ProficiencyType, 
  ValidationResult, 
  ValidationError 
} from './types';

// Class starting proficiencies (SRD)
export const CLASS_PROFICIENCIES: Record<string, ProficiencyType[]> = {
  Barbarian: ['light-armor', 'medium-armor', 'shields', 'simple-weapons', 'martial-weapons'],
  Bard: ['light-armor', 'simple-weapons'],
  Cleric: ['light-armor', 'medium-armor', 'shields', 'simple-weapons'],
  Druid: ['light-armor', 'medium-armor', 'shields', 'simple-weapons'],
  Fighter: ['light-armor', 'medium-armor', 'heavy-armor', 'shields', 'simple-weapons', 'martial-weapons'],
  Monk: ['simple-weapons'],
  Paladin: ['light-armor', 'medium-armor', 'heavy-armor', 'shields', 'simple-weapons', 'martial-weapons'],
  Ranger: ['light-armor', 'medium-armor', 'shields', 'simple-weapons', 'martial-weapons'],
  Rogue: ['light-armor', 'simple-weapons'],
  Sorcerer: ['simple-weapons'],
  Warlock: ['light-armor', 'simple-weapons'],
  Wizard: ['simple-weapons'],
};

// Equipment that requires specific proficiency
export const EQUIPMENT_PROFICIENCY_MAP: Record<string, ProficiencyType> = {
  // Light Armor
  'Padded': 'light-armor',
  'Leather': 'light-armor',
  'Studded Leather': 'light-armor',
  
  // Medium Armor
  'Hide': 'medium-armor',
  'Chain Shirt': 'medium-armor',
  'Scale Mail': 'medium-armor',
  'Breastplate': 'medium-armor',
  'Half Plate': 'medium-armor',
  
  // Heavy Armor
  'Ring Mail': 'heavy-armor',
  'Chain Mail': 'heavy-armor',
  'Splint': 'heavy-armor',
  'Plate': 'heavy-armor',
  
  // Shields
  'Shield': 'shields',
  
  // Simple Weapons
  'Club': 'simple-weapons',
  'Dagger': 'simple-weapons',
  'Greatclub': 'simple-weapons',
  'Handaxe': 'simple-weapons',
  'Javelin': 'simple-weapons',
  'Light Hammer': 'simple-weapons',
  'Mace': 'simple-weapons',
  'Quarterstaff': 'simple-weapons',
  'Sickle': 'simple-weapons',
  'Spear': 'simple-weapons',
  'Light Crossbow': 'simple-weapons',
  'Dart': 'simple-weapons',
  'Shortbow': 'simple-weapons',
  'Sling': 'simple-weapons',
  
  // Martial Weapons
  'Battleaxe': 'martial-weapons',
  'Flail': 'martial-weapons',
  'Glaive': 'martial-weapons',
  'Greataxe': 'martial-weapons',
  'Greatsword': 'martial-weapons',
  'Halberd': 'martial-weapons',
  'Lance': 'martial-weapons',
  'Longsword': 'martial-weapons',
  'Maul': 'martial-weapons',
  'Morningstar': 'martial-weapons',
  'Pike': 'martial-weapons',
  'Rapier': 'martial-weapons',
  'Scimitar': 'martial-weapons',
  'Shortsword': 'martial-weapons',
  'Trident': 'martial-weapons',
  'War Pick': 'martial-weapons',
  'Warhammer': 'martial-weapons',
  'Whip': 'martial-weapons',
  'Blowgun': 'martial-weapons',
  'Hand Crossbow': 'martial-weapons',
  'Heavy Crossbow': 'martial-weapons',
  'Longbow': 'martial-weapons',
  'Net': 'martial-weapons',
};

/**
 * Get the proficiency requirement for an equipment item
 */
export function getEquipmentProficiencyRequirement(itemName: string): ProficiencyType | null {
  return EQUIPMENT_PROFICIENCY_MAP[itemName] || null;
}

/**
 * Check if a class has a specific proficiency
 */
export function classHasProficiency(
  className: string,
  proficiency: ProficiencyType
): boolean {
  const classProficiencies = CLASS_PROFICIENCIES[className];
  if (!classProficiencies) {
    return false;
  }
  return classProficiencies.includes(proficiency);
}

/**
 * Check if a character has proficiency with an equipment item
 */
export function hasProficiencyWithEquipment(
  itemName: string,
  characterClasses: string[],
  additionalProficiencies: string[] = []
): boolean {
  const requiredProficiency = getEquipmentProficiencyRequirement(itemName);
  
  // No proficiency required
  if (!requiredProficiency) {
    return true;
  }
  
  // Check if any class provides this proficiency
  const hasClassProficiency = characterClasses.some((className) =>
    classHasProficiency(className, requiredProficiency)
  );
  
  if (hasClassProficiency) {
    return true;
  }
  
  // Check additional proficiencies (from feats, racial traits, etc.)
  return additionalProficiencies.includes(requiredProficiency);
}

/**
 * Get the penalty for using equipment without proficiency
 */
export function getUnproficientPenalty(item: EquipmentItem): string {
  switch (item.type) {
    case 'armor':
      return 'Disadvantage on ability checks, saving throws, and attack rolls involving Strength or Dexterity, and you cannot cast spells';
    case 'shield':
      return 'Disadvantage on ability checks, saving throws, and attack rolls involving Strength or Dexterity, and you cannot cast spells';
    case 'weapon':
      return 'Cannot add proficiency bonus to attack rolls';
    default:
      return 'No specific penalty';
  }
}

/**
 * Validate equipment proficiency for a character
 */
export function validateEquipmentProficiency(
  item: EquipmentItem,
  characterClasses: string[],
  additionalProficiencies: string[] = []
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  
  const hasProficiency = hasProficiencyWithEquipment(
    item.name,
    characterClasses,
    additionalProficiencies
  );
  
  if (!hasProficiency) {
    const requiredProficiency = getEquipmentProficiencyRequirement(item.name);
    const penalty = getUnproficientPenalty(item);
    
    warnings.push({
      code: 'EQUIPMENT_NOT_PROFICIENT',
      message: `You are not proficient with ${item.name}${requiredProficiency ? ` (requires ${requiredProficiency.replace('-', ' ')})` : ''}`,
      severity: 'warning',
      field: 'equipment',
      suggestion: `Penalty: ${penalty}`,
    });
  }
  
  return {
    isValid: true, // Not proficient is a warning, not an error - you CAN use the item
    errors,
    warnings,
  };
}

/**
 * Validate all equipped items for a character
 */
export function validateAllEquippedItems(
  equippedItems: EquipmentItem[],
  characterClasses: string[],
  additionalProficiencies: string[] = []
): ValidationResult {
  const allErrors: ValidationError[] = [];
  const allWarnings: ValidationError[] = [];
  
  for (const item of equippedItems) {
    const result = validateEquipmentProficiency(
      item,
      characterClasses,
      additionalProficiencies
    );
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
 * Get all proficiencies for a class
 */
export function getClassProficiencies(className: string): ProficiencyType[] {
  return CLASS_PROFICIENCIES[className] || [];
}

/**
 * Get all proficiencies for multiclass characters
 * Note: Multiclassing provides LIMITED proficiencies from new class
 */
export const MULTICLASS_PROFICIENCIES: Record<string, ProficiencyType[]> = {
  Barbarian: ['shields', 'simple-weapons', 'martial-weapons'],
  Bard: ['light-armor'],
  Cleric: ['light-armor', 'medium-armor', 'shields'],
  Druid: ['light-armor', 'medium-armor', 'shields'],
  Fighter: ['light-armor', 'medium-armor', 'shields', 'simple-weapons', 'martial-weapons'],
  Monk: ['simple-weapons'],
  Paladin: ['light-armor', 'medium-armor', 'shields', 'simple-weapons', 'martial-weapons'],
  Ranger: ['light-armor', 'medium-armor', 'shields', 'simple-weapons', 'martial-weapons'],
  Rogue: ['light-armor'],
  Sorcerer: [],
  Warlock: ['light-armor', 'simple-weapons'],
  Wizard: [],
};

/**
 * Get proficiencies gained from multiclassing into a class
 */
export function getMulticlassProficiencies(className: string): ProficiencyType[] {
  return MULTICLASS_PROFICIENCIES[className] || [];
}
