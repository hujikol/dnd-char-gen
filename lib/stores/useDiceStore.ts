import { create } from 'zustand';
import { RollResult } from '@/lib/dice/engine';

interface DiceState {
    isRolling: boolean;
    result: RollResult | null;
    rollType: 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100' | null;
    triggerRoll: (result: RollResult, type: DiceState['rollType']) => void;
    clearRoll: () => void;
}

export const useDiceStore = create<DiceState>((set) => ({
    isRolling: false,
    result: null,
    rollType: null,

    triggerRoll: (result, type) => {
        set({ isRolling: true, result, rollType: type });
        // Auto-clear happens in UI or manual close
    },

    clearRoll: () => {
        set({ isRolling: false });
        setTimeout(() => set({ result: null, rollType: null }), 300); // Wait for exit anim
    }
}));
