/**
 * D&D 5e Feat Prerequisite Validation
 * Validates feat prerequisites based on SRD rules
 */

import type { 
  Feat, 
  FeatPrerequisite, 
  AbilityScores, 
  CharacterForValidation,
  ValidationResult, 
  ValidationError 
} from './types';

// SRD Feats with prerequisites
export const SRD_FEATS: Feat[] = [
  {
    name: 'Grappler',
    prerequisites: [
      { type: 'ability', ability: 'str', minimum: 13, value: 13 }
    ],
    description: 'You have developed the skills necessary to hold your own in close-quarters grappling.'
  },
  {
    name: 'Heavy Armor Master',
    prerequisites: [
      { type: 'proficiency', value: 'heavy-armor' }
    ],
    description: 'You can use your armor to deflect strikes that would kill others.'
  },
  {
    name: 'Heavily Armored',
    prerequisites: [
      { type: 'proficiency', value: 'medium-armor' }
    ],
    description: 'You have trained to master the use of heavy armor.'
  },
  {
    name: 'Lightly Armored',
    prerequisites: [],
    description: 'You have trained to master the use of light armor.'
  },
  {
    name: 'Martial Adept',
    prerequisites: [],
    description: 'You have martial training that allows you to perform special combat maneuvers.'
  },
  {
    name: 'Medium Armor Master',
    prerequisites: [
      { type: 'proficiency', value: 'medium-armor' }
    ],
    description: 'You have practiced moving in medium armor.'
  },
  {
    name: 'Moderately Armored',
    prerequisites: [
      { type: 'proficiency', value: 'light-armor' }
    ],
    description: 'You have trained to master the use of medium armor and shields.'
  },
  {
    name: 'Ritual Caster',
    prerequisites: [
      { type: 'ability', ability: 'int', minimum: 13, value: 13 },
      { type: 'ability', ability: 'wis', minimum: 13, value: 13 }
    ],
    description: 'You have learned a number of spells that you can cast as rituals.'
  },
  {
    name: 'Spell Sniper',
    prerequisites: [
      { type: 'spellcasting', value: 'any' }
    ],
    description: 'You have learned techniques to enhance your attacks with certain kinds of spells.'
  },
  {
    name: 'War Caster',
    prerequisites: [
      { type: 'spellcasting', value: 'any' }
    ],
    description: 'You have practiced casting spells in the midst of combat.'
  },
  {
    name: 'Elemental Adept',
    prerequisites: [
      { type: 'spellcasting', value: 'any' }
    ],
    description: 'You have mastered one damage type from your spellcasting.'
  },
  {
    name: 'Magic Initiate',
    prerequisites: [],
    description: 'You learn two cantrips and one 1st-level spell from a class spell list.'
  },
  {
    name: 'Savage Attacker',
    prerequisites: [],
    description: 'Once per turn when you roll damage for a melee weapon attack, you can reroll the damage dice.'
  },
  {
    name: 'Sentinel',
    prerequisites: [],
    description: 'You have mastered techniques to take advantage of every drop in any enemy\'s guard.'
  },
  {
    name: 'Sharpshooter',
    prerequisites: [],
    description: 'You have mastered ranged weapons and can make shots that others find impossible.'
  },
  {
    name: 'Great Weapon Master',
    prerequisites: [],
    description: 'You\'ve learned to put the weight of a weapon to your advantage.'
  },
  {
    name: 'Dual Wielder',
    prerequisites: [],
    description: 'You master fighting with two weapons.'
  },
  {
    name: 'Defensive Duelist',
    prerequisites: [
      { type: 'ability', ability: 'dex', minimum: 13, value: 13 }
    ],
    description: 'When you are wielding a finesse weapon with which you are proficient and another creature hits you with a melee attack, you can use your reaction to add your proficiency bonus to your AC.'
  },
  {
    name: 'Tough',
    prerequisites: [],
    description: 'Your hit point maximum increases by an amount equal to twice your level.'
  },
  {
    name: 'Resilient',
    prerequisites: [],
    description: 'Choose one ability score. You gain proficiency in saving throws using that ability.'
  }
];

/**
 * Get a feat by name
 */
export function getFeat(featName: string): Feat | undefined {
  return SRD_FEATS.find(
    (feat) => feat.name.toLowerCase() === featName.toLowerCase()
  );
}

/**
 * Check a single prerequisite
 */
function checkPrerequisite(
  prereq: FeatPrerequisite,
  character: CharacterForValidation
): { met: boolean; error?: ValidationError } {
  switch (prereq.type) {
    case 'ability': {
      if (!prereq.ability || !prereq.minimum) {
        return { met: true };
      }
      const score = character.abilityScores[prereq.ability];
      if (score < prereq.minimum) {
        return {
          met: false,
          error: {
            code: 'FEAT_ABILITY_NOT_MET',
            message: `Requires ${prereq.ability.toUpperCase()} ${prereq.minimum}. Current: ${score}`,
            severity: 'error',
            field: `abilityScores.${prereq.ability}`,
            suggestion: `Increase ${prereq.ability.toUpperCase()} to at least ${prereq.minimum}`,
          },
        };
      }
      return { met: true };
    }
    
    case 'proficiency': {
      const profValue = prereq.value as string;
      const hasProficiency = character.proficiencies?.includes(profValue) || false;
      if (!hasProficiency) {
        return {
          met: false,
          error: {
            code: 'FEAT_PROFICIENCY_NOT_MET',
            message: `Requires proficiency with ${profValue.replace('-', ' ')}`,
            severity: 'error',
            field: 'proficiencies',
            suggestion: `Gain ${profValue.replace('-', ' ')} proficiency first`,
          },
        };
      }
      return { met: true };
    }
    
    case 'spellcasting': {
      if (!character.hasSpellcasting) {
        return {
          met: false,
          error: {
            code: 'FEAT_SPELLCASTING_NOT_MET',
            message: 'Requires the ability to cast at least one spell',
            severity: 'error',
            field: 'class',
            suggestion: 'Choose a spellcasting class or take the Magic Initiate feat first',
          },
        };
      }
      return { met: true };
    }
    
    case 'level': {
      const requiredLevel = prereq.value as number;
      if (character.level < requiredLevel) {
        return {
          met: false,
          error: {
            code: 'FEAT_LEVEL_NOT_MET',
            message: `Requires character level ${requiredLevel}. Current: ${character.level}`,
            severity: 'error',
            field: 'level',
          },
        };
      }
      return { met: true };
    }
    
    case 'race': {
      const requiredRace = prereq.value as string;
      if (character.race.toLowerCase() !== requiredRace.toLowerCase()) {
        return {
          met: false,
          error: {
            code: 'FEAT_RACE_NOT_MET',
            message: `Requires ${requiredRace} race`,
            severity: 'error',
            field: 'race',
          },
        };
      }
      return { met: true };
    }
    
    case 'class': {
      const requiredClass = prereq.value as string;
      const hasClass = character.classes.some(
        (c) => c.name.toLowerCase() === requiredClass.toLowerCase()
      );
      if (!hasClass) {
        return {
          met: false,
          error: {
            code: 'FEAT_CLASS_NOT_MET',
            message: `Requires ${requiredClass} class`,
            severity: 'error',
            field: 'class',
          },
        };
      }
      return { met: true };
    }
    
    default:
      return { met: true };
  }
}

/**
 * Validate if a character can take a specific feat
 */
export function validateFeatPrerequisites(
  featName: string,
  character: CharacterForValidation
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  
  const feat = getFeat(featName);
  
  if (!feat) {
    warnings.push({
      code: 'FEAT_UNKNOWN',
      message: `Unknown feat "${featName}"`,
      severity: 'warning',
      field: 'feats',
    });
    return { isValid: true, errors, warnings };
  }
  
  // Check if character already has this feat
  if (character.feats?.includes(featName)) {
    // Some feats can be taken multiple times, but most cannot
    errors.push({
      code: 'FEAT_ALREADY_TAKEN',
      message: `You already have the ${featName} feat`,
      severity: 'error',
      field: 'feats',
    });
  }
  
  // Check all prerequisites
  for (const prereq of feat.prerequisites) {
    const result = checkPrerequisite(prereq, character);
    if (!result.met && result.error) {
      errors.push({
        ...result.error,
        message: `${featName}: ${result.error.message}`,
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
 * Get all feats a character qualifies for
 */
export function getAvailableFeats(character: CharacterForValidation): Feat[] {
  return SRD_FEATS.filter((feat) => {
    const result = validateFeatPrerequisites(feat.name, character);
    return result.isValid;
  });
}

/**
 * Get feats the character is close to qualifying for
 */
export function getNearlyAvailableFeats(
  character: CharacterForValidation
): { feat: Feat; missingPrereqs: ValidationError[] }[] {
  const nearlyAvailable: { feat: Feat; missingPrereqs: ValidationError[] }[] = [];
  
  for (const feat of SRD_FEATS) {
    const result = validateFeatPrerequisites(feat.name, character);
    
    // Only include feats with exactly 1 missing prerequisite
    if (!result.isValid && result.errors.length === 1) {
      nearlyAvailable.push({
        feat,
        missingPrereqs: result.errors,
      });
    }
  }
  
  return nearlyAvailable;
}
