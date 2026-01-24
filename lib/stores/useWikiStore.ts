import { create } from 'zustand';

export type WikiEntity = 'spell' | 'race' | 'class' | 'equipment' | 'condition' | 'monster' | 'rule';

interface WikiState {
  isOpen: boolean;
  entityType: WikiEntity | null;
  entityId: string | null; // This could be the name or a slug/ID
  openWiki: (type: WikiEntity, id: string) => void;
  closeWiki: () => void;
}

export const useWikiStore = create<WikiState>((set) => ({
  isOpen: false,
  entityType: null,
  entityId: null,
  openWiki: (type, id) => set({ isOpen: true, entityType: type, entityId: id }),
  closeWiki: () => set({ isOpen: false, entityType: null, entityId: null }),
}));
