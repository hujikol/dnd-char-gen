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
  // Add other fields as needed
}

interface CharacterState {
  character: Character | null;
  loadingState: 'idle' | 'loading' | 'error';
  loadCharacter: (id: number) => Promise<void>;
  updateCharacter: (updates: Partial<Character>) => void;
  updateAbilityScore: (ability: string, value: number) => void;
  createCharacter: (character: Character) => void;
  initCharacter: () => void;
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

      initCharacter: () =>
        set((state) => {
          state.character = {
            name: "New Character",
            race: "",
            class: "",
            level: 1,
            abilityScores: { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 },
            abilityScoreMethod: 'point-buy',
          };
        }),
    })),
    {
      name: 'character-storage',
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
