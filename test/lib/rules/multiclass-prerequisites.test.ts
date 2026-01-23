import { describe, it, expect } from 'vitest';
import {
  checkMulticlassPrerequisites,
  canMulticlass,
  getMulticlassPrerequisite,
  getMulticlassPrerequisiteDescription,
} from '@/lib/rules/multiclass-prerequisites';
import type { AbilityScores } from '@/lib/rules/types';

describe('Multiclass Prerequisites', () => {
  describe('getMulticlassPrerequisite', () => {
    it('should return prerequisite for known class', () => {
      const prereq = getMulticlassPrerequisite('Fighter');
      expect(prereq).toBeDefined();
      expect(prereq?.className).toBe('Fighter');
    });

    it('should return undefined for unknown class', () => {
      const prereq = getMulticlassPrerequisite('Unknown');
      expect(prereq).toBeUndefined();
    });

    it('should be case-insensitive', () => {
      const prereq = getMulticlassPrerequisite('WIZARD');
      expect(prereq).toBeDefined();
      expect(prereq?.className).toBe('Wizard');
    });
  });

  describe('checkMulticlassPrerequisites', () => {
    it('should pass when ability scores meet requirements', () => {
      const scores: AbilityScores = { str: 14, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
      const result = checkMulticlassPrerequisites('Barbarian', scores);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when ability scores do not meet requirements', () => {
      const scores: AbilityScores = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
      const result = checkMulticlassPrerequisites('Barbarian', scores);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].code).toBe('MULTICLASS_PREREQ_NOT_MET');
    });

    it('should handle "any" requirement type correctly (Fighter)', () => {
      // Fighter requires STR 13 OR DEX 13
      const scoresWithStr: AbilityScores = { str: 14, dex: 8, con: 10, int: 10, wis: 10, cha: 10 };
      const resultWithStr = checkMulticlassPrerequisites('Fighter', scoresWithStr);
      expect(resultWithStr.isValid).toBe(true);

      const scoresWithDex: AbilityScores = { str: 8, dex: 14, con: 10, int: 10, wis: 10, cha: 10 };
      const resultWithDex = checkMulticlassPrerequisites('Fighter', scoresWithDex);
      expect(resultWithDex.isValid).toBe(true);

      const scoresWithNeither: AbilityScores = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
      const resultWithNeither = checkMulticlassPrerequisites('Fighter', scoresWithNeither);
      expect(resultWithNeither.isValid).toBe(false);
    });

    it('should handle "all" requirement type correctly (Monk)', () => {
      // Monk requires DEX 13 AND WIS 13
      const scoresWithBoth: AbilityScores = { str: 10, dex: 14, con: 10, int: 10, wis: 14, cha: 10 };
      const resultWithBoth = checkMulticlassPrerequisites('Monk', scoresWithBoth);
      expect(resultWithBoth.isValid).toBe(true);

      const scoresWithOnlyDex: AbilityScores = { str: 10, dex: 14, con: 10, int: 10, wis: 10, cha: 10 };
      const resultWithOnlyDex = checkMulticlassPrerequisites('Monk', scoresWithOnlyDex);
      expect(resultWithOnlyDex.isValid).toBe(false);

      const scoresWithOnlyWis: AbilityScores = { str: 10, dex: 10, con: 10, int: 10, wis: 14, cha: 10 };
      const resultWithOnlyWis = checkMulticlassPrerequisites('Monk', scoresWithOnlyWis);
      expect(resultWithOnlyWis.isValid).toBe(false);
    });

    it('should return warning for unknown class', () => {
      const scores: AbilityScores = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
      const result = checkMulticlassPrerequisites('UnknownClass', scores);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0].code).toBe('MULTICLASS_UNKNOWN_CLASS');
    });
  });

  describe('canMulticlass', () => {
    it('should check both current AND target class prerequisites', () => {
      // Character is a Wizard (INT 13 required) wanting to multiclass into Rogue (DEX 13 required)
      const scoresValid: AbilityScores = { str: 10, dex: 14, con: 10, int: 14, wis: 10, cha: 10 };
      const resultValid = canMulticlass(['Wizard'], 'Rogue', scoresValid);
      expect(resultValid.isValid).toBe(true);

      // Missing INT for Wizard
      const scoresMissingInt: AbilityScores = { str: 10, dex: 14, con: 10, int: 10, wis: 10, cha: 10 };
      const resultMissingInt = canMulticlass(['Wizard'], 'Rogue', scoresMissingInt);
      expect(resultMissingInt.isValid).toBe(false);

      // Missing DEX for Rogue
      const scoresMissingDex: AbilityScores = { str: 10, dex: 10, con: 10, int: 14, wis: 10, cha: 10 };
      const resultMissingDex = canMulticlass(['Wizard'], 'Rogue', scoresMissingDex);
      expect(resultMissingDex.isValid).toBe(false);
    });
  });

  describe('getMulticlassPrerequisiteDescription', () => {
    it('should return readable description for single requirement', () => {
      const desc = getMulticlassPrerequisiteDescription('Barbarian');
      expect(desc).toBe('STR 13');
    });

    it('should use "and" for "all" requirement type', () => {
      const desc = getMulticlassPrerequisiteDescription('Monk');
      expect(desc).toBe('DEX 13 and WIS 13');
    });

    it('should use "or" for "any" requirement type', () => {
      const desc = getMulticlassPrerequisiteDescription('Fighter');
      expect(desc).toBe('STR 13 or DEX 13');
    });
  });
});
