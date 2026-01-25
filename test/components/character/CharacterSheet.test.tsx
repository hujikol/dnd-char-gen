import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CharacterSheet } from '@/components/character/CharacterSheet';
import * as DexieHooks from 'dexie-react-hooks';

vi.mock('dexie-react-hooks', () => ({
    useLiveQuery: vi.fn(),
}));

vi.mock('@/components/ui/card', () => ({
    Card: ({ children, className }: any) => <div className={className}>{children}</div>,
    CardHeader: ({ children }: any) => <div>{children}</div>,
    CardTitle: ({ children }: any) => <h3>{children}</h3>,
    CardContent: ({ children }: any) => <div>{children}</div>,
}));

describe('CharacterSheet', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('renders character details', () => {
        const mockChar = {
            id: 1,
            name: "Gimli",
            race: "Dwarf",
            class: "Fighter",
            background: "Soldier",
            level: 3,
            data: {
                race: "Dwarf",
                background: "Soldier",
                abilityScores: { str: 16, dex: 12, con: 14, int: 8, wis: 10, cha: 8 },
                hitDice: { current: 3, max: 3, die: "d10" },
                hp: { current: 30, max: 30, temp: 0 },
                inventory: [],
                currency: { gp: 0, sp: 0, cp: 0, ep: 0, pp: 0 }
            }

        };

        (DexieHooks.useLiveQuery as any).mockReturnValue(mockChar);

        render(<CharacterSheet id={1} />);

        expect(screen.getByText("Gimli")).toBeInTheDocument();
        expect(screen.getByText(/Level 3 Fighter/)).toBeInTheDocument();
        expect(screen.getByText(/Dwarf/)).toBeInTheDocument();
        expect(screen.getByText(/Soldier/)).toBeInTheDocument();

        // Ability Scores rendering
        expect(screen.getAllByText("16")[0]).toBeInTheDocument(); // STR
        expect(screen.getAllByText("+3")[0]).toBeInTheDocument(); // STR Mod

    });

    it('displays not found message if character is null', () => {
        (DexieHooks.useLiveQuery as any).mockReturnValue(null);
        render(<CharacterSheet id={99} />);
        expect(screen.getByText("Character not found")).toBeInTheDocument();
    });
});
