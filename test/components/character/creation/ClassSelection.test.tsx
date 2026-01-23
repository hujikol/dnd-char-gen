import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ClassSelection } from '@/components/character/creation/ClassSelection';
import { useCharacterStore } from '@/lib/stores/useCharacterStore';
import * as DexieHooks from 'dexie-react-hooks';

vi.mock('@/lib/stores/useCharacterStore', () => ({
    useCharacterStore: vi.fn(),
}));

vi.mock('dexie-react-hooks', () => ({
    useLiveQuery: vi.fn(),
}));

vi.mock('@/components/ui/card', () => ({
    Card: ({ children, className, onClick }: any) => (
        <div data-testid="card" className={className} onClick={onClick}>
            {children}
        </div>
    ),
    CardHeader: ({ children }: any) => <div>{children}</div>,
    CardTitle: ({ children }: any) => <h3>{children}</h3>,
    CardContent: ({ children }: any) => <div>{children}</div>,
}));

const mockClasses = [
    { name: 'Wizard', hitDie: 6, primaryAbility: 'Intelligence', data: {} },
    { name: 'Fighter', hitDie: 10, primaryAbility: 'Strength or Dexterity', data: {} },
];

describe('ClassSelection', () => {
    const mockUpdateCharacter = vi.fn();
    const mockOnNext = vi.fn();
    const mockOnBack = vi.fn();

    beforeEach(() => {
        vi.resetAllMocks();
        (DexieHooks.useLiveQuery as any).mockReturnValue(mockClasses);
        (useCharacterStore as any).mockReturnValue({
            character: { class: '' },
            updateCharacter: mockUpdateCharacter,
        });
    });

    it('renders available classes', () => {
        render(<ClassSelection onNext={mockOnNext} onBack={mockOnBack} />);
        expect(screen.getByText('Wizard')).toBeInTheDocument();
        expect(screen.getByText('Fighter')).toBeInTheDocument();
    });

    it('updates character and enables next button on selection', () => {
        render(<ClassSelection onNext={mockOnNext} onBack={mockOnBack} />);

        fireEvent.click(screen.getByText('Wizard'));

        expect(mockUpdateCharacter).toHaveBeenCalledWith({ class: 'Wizard' });

        // There are two buttons "Back", but "Next: Background" should be unique
        const nextButton = screen.getByRole('button', { name: /Next: Background/i });
        expect(nextButton).toBeEnabled();

        fireEvent.click(nextButton);
        expect(mockOnNext).toHaveBeenCalled();
    });

    it('calls onBack when back button is clicked', () => {
        render(<ClassSelection onNext={mockOnNext} onBack={mockOnBack} />);
        // Select the first visible Back button
        const backButtons = screen.getAllByRole('button', { name: /Back/i });
        fireEvent.click(backButtons[0]);
        expect(mockOnBack).toHaveBeenCalled();
    });
});
