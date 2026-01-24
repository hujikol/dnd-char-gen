import { z } from "zod";

export const InventoryItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.number().int().nonnegative(),
  weight: z.number().nonnegative(),
  category: z.string().optional(),
  notes: z.string().optional(),
  equipped: z.boolean().optional(),
  type: z.enum(['weapon', 'armor', 'shield', 'other']).optional(),
  properties: z.any().optional(),
  isMagic: z.boolean().optional(),
  requiresAttunement: z.boolean().optional(),
  attuned: z.boolean().optional(),
});

export const SpellSchema = z.object({
  name: z.string(),
  level: z.number().int().min(0).max(9),
  school: z.string().optional(),
  prepared: z.boolean().optional(),
  ritual: z.boolean().optional(),
  source: z.string().optional(),
});

export const CharacterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  race: z.string().min(1, "Race is required"),
  class: z.string().min(1, "Class is required"),
  background: z.string().optional(),
  level: z.number().int().min(1).max(20),
  abilityScores: z.record(z.string(), z.number().int().min(1).max(30)),
  abilityScoreMethod: z.enum(['point-buy', 'standard-array', 'manual']),
  hp: z.object({
    current: z.number().int(),
    max: z.number().int().min(1),
    temp: z.number().int(),
  }),
  hitDice: z.object({
    current: z.number().int().nonnegative(),
    max: z.number().int().min(1),
    die: z.string(),
  }),
  deathSaves: z.object({
    successes: z.number().int().min(0).max(3),
    failures: z.number().int().min(0).max(3),
  }),
  attacks: z.array(z.object({
    id: z.string(),
    name: z.string(),
    bonus: z.number(),
    damage: z.string(),
    type: z.string(),
  })).optional(),
  skillProficiencies: z.array(z.string()).optional(),
  savingThrowProficiencies: z.array(z.string()).optional(),
  initiative: z.number().optional(),
  spellSlots: z.record(z.number(), z.object({
    max: z.number().int().nonnegative(),
    current: z.number().int().nonnegative(),
  })).optional(),
  pactSlots: z.object({
    max: z.number().int().nonnegative(),
    current: z.number().int().nonnegative(),
    level: z.number().int().min(1).max(9),
  }).optional(),
  spells: z.array(SpellSchema).optional(),
  inventory: z.array(InventoryItemSchema),
  currency: z.object({
    cp: z.number().int().nonnegative(),
    sp: z.number().int().nonnegative(),
    ep: z.number().int().nonnegative(),
    gp: z.number().int().nonnegative(),
    pp: z.number().int().nonnegative(),
  }),
});

export type CharacterInput = z.infer<typeof CharacterSchema>;
