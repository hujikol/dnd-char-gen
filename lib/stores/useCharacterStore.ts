import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { get, set, del } from 'idb-keyval';

export interface Character {
  name: string;
  race: string;
  class: string;
  level: number;
  stats: Record<string, number>;
  // Add other fields as needed
}

interface CharacterState {
  character: Character | null;
  loadingState: 'idle' | 'loading' | 'error';
  loadCharacter: () => Promise<void>;
  updateCharacter: (updates: Partial<Character>) => void;
  createCharacter: (character: Character) => void;
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

      loadCharacter: async () => {
        set((state) => { state.loadingState = 'loading'; });
        try {
          // Simulation or logic here
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

      createCharacter: (character) =>
        set((state) => {
          state.character = character;
        }),
    })),
    {
      name: 'character-storage',
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
