import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { get, set, del } from 'idb-keyval';

export interface Character {
  name: string;
  race: string;
  class: string;
  background?: string;
  level: number;
  abilityScores: Record<string, number>;
  abilityScoreMethod: 'point-buy' | 'standard-array' | 'manual';
  hp: {
    current: number;
    max: number;
    temp: number;
  };
  hitDice: {
    current: number;
    max: number;
    die: string; // e.g. "d8", "d10"
  };
  deathSaves: {
    successes: number;
    failures: number;
  };
  attacks?: {
    id: string;
    name: string;
    bonus: number;
    damage: string;
    type: string;
  }[];
  skillProficiencies?: string[]; // List of skill names that are proficient
  savingThrowProficiencies?: string[]; // List of ability keys (str, dex, etc.)
  initiative?: number;
  spellSlots?: Record<number, { max: number; current: number }>;
  pactSlots?: { max: number; current: number; level: number };
  spells?: {
    name: string;
    level: number;
    school?: string;
    prepared?: boolean;
    ritual?: boolean;
    source?: string; // e.g. "Create Bonfire" from SRD
  }[];
  inventory: InventoryItem[];
  // Add other fields as needed
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  weight: number;
  category?: string;
  notes?: string;
  equipped?: boolean;
  type?: 'weapon' | 'armor' | 'shield' | 'other';
  properties?: any; // For AC, Damage, etc.
}

interface CharacterState {
  character: Character | null;
  loadingState: 'idle' | 'loading' | 'error';
  loadCharacter: (id: number) => Promise<void>;
  updateCharacter: (updates: Partial<Character>) => void;
  updateAbilityScore: (ability: string, value: number) => void;
  createCharacter: (character: Character) => void;
  performLongRest: () => void;
  initCharacter: () => void;
  
  // Inventory Actions
  addItem: (item: Omit<InventoryItem, 'id'>) => void;
  removeItem: (itemId: string) => void;
  updateItem: (itemId: string, updates: Partial<InventoryItem>) => void;
}

const idbStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const value = await get(name);
    return value || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

export const useCharacterStore = create<CharacterState>()(
  persist(
    immer((set) => ({
      character: null,
      loadingState: 'idle',

      loadCharacter: async (id: number) => {
        set((state) => { state.loadingState = 'loading'; });
        try {
          // Check if we have it in memory/storage first (via persist), handled by hydration
          // But here we might want to reload from DB if strictly needed
          // For now, let's assume persist middleware handles hydration of 'character'
          // If we want to load a SPECIFIC id from IndexedDB into 'character', we can do:
           // const char = await db.characters.get(id);
           // if (char) set(state => { state.character = char; state.loadingState = 'idle' });
           // But CharacterDB and Character types might differ slightly.
           set((state) => { state.loadingState = 'idle'; });
        } catch (error) {
          set((state) => { state.loadingState = 'error'; });
        }
      },

      updateCharacter: (updates) =>
        set((state) => {
          if (state.character) {
            Object.assign(state.character, updates);
          }
        }),

      updateAbilityScore: (ability, value) =>
        set((state) => {
          if (state.character) {
             state.character.abilityScores[ability] = value;
          }
        }),

      createCharacter: (character) =>
        set((state) => {
          state.character = character;
        }),

      performLongRest: () =>
        set((state) => {
          if (state.character) {
            // Restore HP
            state.character.hp.current = state.character.hp.max;
            state.character.hp.temp = 0;

            // Reset Death Saves
            state.character.deathSaves.successes = 0;
            state.character.deathSaves.failures = 0;

            // Recover Hit Dice (up to half of max, min 1)
            const hitDiceMax = state.character.hitDice.max;
            const recoverAmount = Math.max(1, Math.floor(hitDiceMax / 2));
            state.character.hitDice.current = Math.min(
                hitDiceMax,
                state.character.hitDice.current + recoverAmount
            );

            // Restore Spell Slots
            if (state.character.spellSlots) {
                Object.values(state.character.spellSlots).forEach(slot => {
                    slot.current = slot.max;
                });
            }
            
            // Restore Pact Slots
            if (state.character.pactSlots) {
                state.character.pactSlots.current = state.character.pactSlots.max;
            }
          }
        }),

      initCharacter: () =>
        set((state) => {
          state.character = {
            name: "New Character",
            race: "",
            class: "",
            level: 1,
            abilityScores: { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 },
            abilityScoreMethod: 'point-buy',
            hp: { current: 10, max: 10, temp: 0 },
            hitDice: { current: 1, max: 1, die: "d8" },
            deathSaves: { successes: 0, failures: 0 },
            inventory: [],
          };
        }),

      addItem: (item) =>
        set((state) => {
          if (state.character) {
            if (!state.character.inventory) state.character.inventory = [];
            state.character.inventory.push({
                ...item,
                id: crypto.randomUUID(),
            });
          }
        }),

      removeItem: (itemId) =>
        set((state) => {
          if (state.character && state.character.inventory) {
            state.character.inventory = state.character.inventory.filter(i => i.id !== itemId);
          }
        }),

      updateItem: (itemId, updates) =>
        set((state) => {
          if (state.character && state.character.inventory) {
            const item = state.character.inventory.find(i => i.id === itemId);
            if (item) {
              Object.assign(item, updates);
            }
          }
        }),
    })),
    {
      name: 'character-storage',
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
