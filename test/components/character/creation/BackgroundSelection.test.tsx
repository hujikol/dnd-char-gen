import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BackgroundSelection } from '@/components/character/creation/BackgroundSelection';
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

const mockBackgrounds = [
    { name: 'Acolyte', data: { description: 'Temple service' } },
    { name: 'Soldier', data: { description: 'War veteran' } },
];

describe('BackgroundSelection', () => {
    const mockUpdateCharacter = vi.fn();
    const mockOnNext = vi.fn();
    const mockOnBack = vi.fn();

    beforeEach(() => {
        vi.resetAllMocks();
        (DexieHooks.useLiveQuery as any).mockReturnValue(mockBackgrounds);
        (useCharacterStore as any).mockReturnValue({
            character: { background: '' },
            updateCharacter: mockUpdateCharacter,
        });
    });

    it('renders available backgrounds', () => {
        render(<BackgroundSelection onNext={mockOnNext} onBack={mockOnBack} />);
        expect(screen.getByText('Acolyte')).toBeInTheDocument();
        expect(screen.getByText('Soldier')).toBeInTheDocument();
    });

    it('updates character and enables next button on selection', () => {
        render(<BackgroundSelection onNext={mockOnNext} onBack={mockOnBack} />);

        fireEvent.click(screen.getByText('Acolyte'));

        expect(mockUpdateCharacter).toHaveBeenCalledWith({ background: 'Acolyte' });

        const nextButton = screen.getByRole('button', { name: /Next: Abilities/i });
        expect(nextButton).toBeEnabled();

        fireEvent.click(nextButton);
        expect(mockOnNext).toHaveBeenCalled();
    });
});
