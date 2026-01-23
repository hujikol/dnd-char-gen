import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PointBuyCalculator } from '@/components/character/creation/abilities/PointBuyCalculator';
import { useCharacterStore } from '@/lib/stores/useCharacterStore';

vi.mock('@/lib/stores/useCharacterStore', () => ({
    useCharacterStore: vi.fn(),
}));

describe('PointBuyCalculator', () => {
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

    it('renders all ability scores', () => {
        render(<PointBuyCalculator />);
        expect(screen.getByText('str')).toBeInTheDocument();
        expect(screen.getByText('dex')).toBeInTheDocument();
        expect(screen.getByText('cha')).toBeInTheDocument();
    });

    it('calculates remaining points correctly', () => {
        render(<PointBuyCalculator />);
        // Both Total and Remaining are 27 initially
        expect(screen.getAllByText('27')).toHaveLength(2);
    });

    it('increments score and updates store', () => {
        render(<PointBuyCalculator />);

        const increaseStrBtn = screen.getByLabelText('Increase str');
        fireEvent.click(increaseStrBtn);
        expect(mockUpdateAbilityScore).toHaveBeenCalledWith('str', 9);
    });
});
