/**
 * Validation types for the D&D 5e Rules Engine
 */

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationError {
  code: string;
  message: string;
  severity: ValidationSeverity;
  field?: string;
  suggestion?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

// D&D 5e Ability Score names
export type AbilityScore = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

export interface AbilityScores {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

// Multiclass prerequisite requirements per class (D&D 5e SRD)
export interface MulticlassRequirement {
  className: string;
  requirements: {
    ability: AbilityScore;
    minimum: number;
  }[];
  // Some classes require meeting one OR another requirement
  requirementType: 'all' | 'any';
}

// Character class data
export interface CharacterClass {
  name: string;
  level: number;
}

// Equipment proficiency types
export type ProficiencyType = 
  | 'light-armor'
  | 'medium-armor'
  | 'heavy-armor'
  | 'shields'
  | 'simple-weapons'
  | 'martial-weapons'
  | 'specific-weapon';

export interface EquipmentItem {
  name: string;
  type: 'weapon' | 'armor' | 'shield' | 'equipment';
  proficiencyRequired?: ProficiencyType;
  specificProficiency?: string; // For specific weapon proficiencies
  weight?: number;
  armorClass?: number;
  damage?: string;
}

// Feat prerequisites
export interface FeatPrerequisite {
  type: 'ability' | 'proficiency' | 'spellcasting' | 'race' | 'class' | 'level';
  value: string | number;
  ability?: AbilityScore;
  minimum?: number;
}

export interface Feat {
  name: string;
  prerequisites: FeatPrerequisite[];
  description: string;
}

// Spell data
export interface Spell {
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  classes: string[];
  ritual?: boolean;
}

// Known spells limits by class and level
export interface SpellsKnownLimit {
  className: string;
  // Key is character level, value is number of spells known
  spellsKnownByLevel: Record<number, number>;
  // Whether this class uses prepared spells instead
  usesPreparedSpells: boolean;
}

// Point Buy validation
export interface PointBuyConfig {
  totalPoints: number;
  minScore: number;
  maxScore: number;
  costs: Record<number, number>;
}

// Character for validation
export interface CharacterForValidation {
  name: string;
  race: string;
  classes: CharacterClass[];
  background?: string;
  level: number;
  abilityScores: AbilityScores;
  abilityScoreMethod: 'point-buy' | 'standard-array' | 'manual';
  proficiencies?: string[];
  feats?: string[];
  knownSpells?: string[];
  equippedItems?: EquipmentItem[];
  hasSpellcasting?: boolean;
}
