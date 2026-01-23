import { describe, it, expect } from 'vitest';
import {
  getMaxSpellLevel,
  canClassCastSpell,
  filterSpellsByClassAndLevel,
  validateSpellSelection,
  CLASS_CASTER_TYPES,
} from '@/lib/rules/spell-filtering';
import type { Spell } from '@/lib/rules/types';

const mockSpells: Spell[] = [
  {
    name: 'Fire Bolt',
    level: 0,
    school: 'Evocation',
    castingTime: '1 action',
    range: '120 feet',
    components: 'V, S',
    duration: 'Instantaneous',
    description: 'A beam of fire',
    classes: ['Sorcerer', 'Wizard'],
  },
  {
    name: 'Magic Missile',
    level: 1,
    school: 'Evocation',
    castingTime: '1 action',
    range: '120 feet',
    components: 'V, S',
    duration: 'Instantaneous',
    description: 'Three darts of magical force',
    classes: ['Sorcerer', 'Wizard'],
  },
  {
    name: 'Cure Wounds',
    level: 1,
    school: 'Evocation',
    castingTime: '1 action',
    range: 'Touch',
    components: 'V, S',
    duration: 'Instantaneous',
    description: 'Heals a creature',
    classes: ['Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger'],
  },
  {
    name: 'Fireball',
    level: 3,
    school: 'Evocation',
    castingTime: '1 action',
    range: '150 feet',
    components: 'V, S, M',
    duration: 'Instantaneous',
    description: 'A ball of fire',
    classes: ['Sorcerer', 'Wizard'],
  },
];

describe('Spell Filtering', () => {
  describe('getMaxSpellLevel', () => {
    it('should return 0 for non-casters', () => {
      expect(getMaxSpellLevel('Barbarian', 20)).toBe(0);
      expect(getMaxSpellLevel('Monk', 20)).toBe(0);
    });

    it('should return correct max level for full casters', () => {
      expect(getMaxSpellLevel('Wizard', 1)).toBe(1);
      expect(getMaxSpellLevel('Wizard', 3)).toBe(2);
      expect(getMaxSpellLevel('Wizard', 5)).toBe(3);
      expect(getMaxSpellLevel('Wizard', 9)).toBe(5);
      expect(getMaxSpellLevel('Wizard', 17)).toBe(9);
    });

    it('should return correct max level for half casters', () => {
      expect(getMaxSpellLevel('Paladin', 1)).toBe(0); // No spells at level 1
      expect(getMaxSpellLevel('Paladin', 2)).toBe(1);
      expect(getMaxSpellLevel('Paladin', 5)).toBe(2);
      expect(getMaxSpellLevel('Ranger', 9)).toBe(3);
    });

    it('should return correct max level for Warlock', () => {
      expect(getMaxSpellLevel('Warlock', 1)).toBe(1);
      expect(getMaxSpellLevel('Warlock', 5)).toBe(3);
      expect(getMaxSpellLevel('Warlock', 9)).toBe(5);
    });
  });

  describe('canClassCastSpell', () => {
    it('should return true when spell is on class list', () => {
      expect(canClassCastSpell('Wizard', mockSpells[0])).toBe(true);
      expect(canClassCastSpell('Cleric', mockSpells[2])).toBe(true);
    });

    it('should return false when spell is not on class list', () => {
      expect(canClassCastSpell('Wizard', mockSpells[2])).toBe(false);
      expect(canClassCastSpell('Cleric', mockSpells[0])).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(canClassCastSpell('wizard', mockSpells[0])).toBe(true);
    });
  });

  describe('filterSpellsByClassAndLevel', () => {
    it('should only return spells available to the class', () => {
      const filtered = filterSpellsByClassAndLevel(mockSpells, 'Wizard', 20);
      expect(filtered.every(s => s.classes.includes('Wizard'))).toBe(true);
    });

    it('should filter by spell level', () => {
      const filtered = filterSpellsByClassAndLevel(mockSpells, 'Wizard', 3);
      // Level 3 Wizard can cast up to 2nd level spells
      expect(filtered.every(s => s.level <= 2)).toBe(true);
    });

    it('should always include cantrips', () => {
      const filtered = filterSpellsByClassAndLevel(mockSpells, 'Wizard', 1);
      expect(filtered.some(s => s.level === 0)).toBe(true);
    });
  });

  describe('validateSpellSelection', () => {
    it('should pass for valid spell selection', () => {
      const result = validateSpellSelection(mockSpells[1], 'Wizard', 5);
      expect(result.isValid).toBe(true);
    });

    it('should fail when spell is not on class list', () => {
      const result = validateSpellSelection(mockSpells[2], 'Wizard', 20);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('SPELL_NOT_ON_CLASS_LIST');
    });

    it('should fail when spell level is too high', () => {
      const result = validateSpellSelection(mockSpells[3], 'Wizard', 1);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].code).toBe('SPELL_LEVEL_TOO_HIGH');
    });

    it('should fail for non-caster classes', () => {
      const result = validateSpellSelection(mockSpells[1], 'Barbarian', 20);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'CLASS_CANNOT_CAST_SPELLS')).toBe(true);
    });
  });
});
