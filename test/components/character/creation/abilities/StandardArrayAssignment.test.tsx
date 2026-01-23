import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StandardArrayAssignment } from '@/components/character/creation/abilities/StandardArrayAssignment';
import { useCharacterStore } from '@/lib/stores/useCharacterStore';

vi.mock('@/lib/stores/useCharacterStore', () => ({
    useCharacterStore: vi.fn(),
}));

// Mock Shadcn Select - it is hard to test because it uses Radix Portals. 
// We will mock the Select components to rely on standard HTML Select for simpler logic testing
// or just mock the internals.
// Actually, let's just inspect if "str" is there and try to interact if possible. 
// But Radix UI Select is notoriously hard to integration test without full DOM.
// A simpler unit test verifying it CALLS the store is enough.

vi.mock('@/components/ui/select', () => ({
    Select: ({ onValueChange, children }: any) => <div data-testid="select" onClick={() => onValueChange('15')}>{children}</div>,
    SelectTrigger: ({ children }: any) => <button>{children}</button>,
    SelectValue: () => <div>Value</div>,
    SelectContent: ({ children }: any) => <div>{children}</div>,
    SelectItem: ({ children }: any) => <div>{children}</div>,
}));

describe('StandardArrayAssignment', () => {
    const mockUpdateAbilityScore = vi.fn();

    beforeEach(() => {
        vi.resetAllMocks();
        (useCharacterStore as any).mockReturnValue({
            character: {
                abilityScores: { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 }
            },
            updateAbilityScore: mockUpdateAbilityScore,
        });
    });

    it('renders abilities', () => {
        render(<StandardArrayAssignment />);
        expect(screen.getByText('str')).toBeInTheDocument();
    });

    it('calls update on value change', () => {
        render(<StandardArrayAssignment />);

        const selects = screen.getAllByTestId('select');
        // Click first one (str)
        fireEvent.click(selects[0]);

        expect(mockUpdateAbilityScore).toHaveBeenCalledWith('str', 15);
    });
});
