import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CharacterCard } from '@/components/character/CharacterCard';
import { CharacterDB } from '@/lib/db/schema';

describe('CharacterCard', () => {
    const mockCharacter: CharacterDB = {
        id: 1,
        name: 'Gandalf',
        class: 'Wizard',
        level: 20,
        data: {
            race: 'Human',
        },
    };

    it('renders character details correctly', () => {
        render(<CharacterCard character={mockCharacter} />);

        expect(screen.getByText('Gandalf')).toBeInTheDocument();
        expect(screen.getByText('Human')).toBeInTheDocument();
        expect(screen.getByText('Wizard')).toBeInTheDocument();
        expect(screen.getByText('20')).toBeInTheDocument();
    });

    it('renders "Unknown Race" when race is missing', () => {
        const charWithoutRace: CharacterDB = {
            ...mockCharacter,
            id: 2,
            data: {},
        };
        render(<CharacterCard character={charWithoutRace} />);
        expect(screen.getByText('Unknown Race')).toBeInTheDocument();
    });
});
