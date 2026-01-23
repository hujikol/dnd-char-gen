import { db, CharacterDB, RaceDB, ClassDB, BackgroundDB } from './schema';

export const getAllCharacters = async (): Promise<CharacterDB[]> => {
  return await db.characters.toArray();
};

export const getCharacterById = async (id: number): Promise<CharacterDB | undefined> => {
  return await db.characters.get(id);
};

export const addCharacter = async (character: CharacterDB): Promise<number> => {
  // Use 'put' or 'add'. 'add' fails if key exists (if fixed key).
  // For auto-increment id, 'add' is fine.
  return await db.characters.add(character);
};

export const updateCharacter = async (id: number, updates: Partial<CharacterDB>): Promise<number> => {
   return await db.characters.update(id, updates);
}

export const deleteCharacter = async (id: number): Promise<void> => {
    await db.characters.delete(id);
}

export const getAllRaces = async (): Promise<RaceDB[]> => {
  return await db.races.toArray();
};

export const getAllClasses = async (): Promise<ClassDB[]> => {
  return await db.classes.toArray();
};

export const getAllBackgrounds = async (): Promise<BackgroundDB[]> => {
  return await db.backgrounds.toArray();
};
