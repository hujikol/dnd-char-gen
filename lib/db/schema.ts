import Dexie, { Table } from 'dexie';



export interface CharacterDB {
  id?: number;
  name: string;
  class: string;
  level: number;
  data: any;
}

export interface ClassDB {
  name: string;
  hitDie: number;
  primaryAbility: string;
  data: any;
}

export interface RaceDB {
  name: string;
  data: any;
}

export interface SpellDB {
  name: string;
  level: number;
  classes: string[];
  data: any;
}

export interface EquipmentDB {
  name: string;
  type: string;
  cost: string;
  data: any;
}

export interface BackgroundDB {
  name: string;
  data: any;
}

export interface RollHistoryDB {
  id?: number;
  timestamp: number;
  characterId?: number;
  result: any;
}

export interface VersionDB {
  id: string;
  version: string;
}

export interface ConditionDB {
  name: string;
  data: any;
}

export class DnDDatabase extends Dexie {
  characters!: Table<CharacterDB, number>;
  classes!: Table<ClassDB, string>;
  races!: Table<RaceDB, string>;
  backgrounds!: Table<BackgroundDB, string>;
  spells!: Table<SpellDB, string>;
  equipment!: Table<EquipmentDB, string>;
  conditions!: Table<ConditionDB, string>;
  rollHistory!: Table<RollHistoryDB, number>;
  versions!: Table<VersionDB, string>;

  constructor() {
    super('DnDCharacterGenerator');
    this.version(1).stores({
      characters: '++id, name, class, level',
      classes: 'name, hitDie, primaryAbility',
      races: 'name',
      spells: 'name, level, *classes',
      equipment: 'name, type, cost',
      rollHistory: '++id, timestamp, characterId',
      versions: 'id' 
    });
    this.version(2).stores({
      backgrounds: 'name'
    });
    this.version(3).stores({
      conditions: 'name'
    });
  }
}


export const db = new DnDDatabase();
