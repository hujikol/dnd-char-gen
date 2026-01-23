import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RaceSelection } from '@/components/character/creation/RaceSelection';
import { useCharacterStore } from '@/lib/stores/useCharacterStore';
import * as DexieHooks from 'dexie-react-hooks';

// Mock dependencies
vi.mock('@/lib/stores/useCharacterStore', () => ({
    useCharacterStore: vi.fn(),
}));

vi.mock('dexie-react-hooks', () => ({
    useLiveQuery: vi.fn(),
}));

// Mock simple Card components to avoid Shadcn structure complexity in tests
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

const mockRaces = [
    { name: 'Human', data: {} },
    { name: 'Elf', data: {} },
];

describe('RaceSelection', () => {
    const mockUpdateCharacter = vi.fn();
    const mockOnNext = vi.fn();

    beforeEach(() => {
        vi.resetAllMocks();
        (DexieHooks.useLiveQuery as any).mockReturnValue(mockRaces);
        (useCharacterStore as any).mockReturnValue({
            character: { race: '' },
            updateCharacter: mockUpdateCharacter,
        });
    });

    it('renders available races', () => {
        render(<RaceSelection onNext={mockOnNext} />);
        expect(screen.getByText('Human')).toBeInTheDocument();
        expect(screen.getByText('Elf')).toBeInTheDocument();
    });

    it('updates character and enables next button on selection', () => {
        render(<RaceSelection onNext={mockOnNext} />);

        // Find the Human card/title and click
        fireEvent.click(screen.getByText('Human'));

        expect(mockUpdateCharacter).toHaveBeenCalledWith({ race: 'Human' });

        const nextButton = screen.getByRole('button', { name: /Choose Class/i });
        expect(nextButton).toBeEnabled();

        fireEvent.click(nextButton);
        expect(mockOnNext).toHaveBeenCalled();
    });

    it('pre-selects race if already in store', () => {
        (useCharacterStore as any).mockReturnValue({
            character: { race: 'Elf' },
            updateCharacter: mockUpdateCharacter,
        });

        render(<RaceSelection onNext={mockOnNext} />);

        const nextButton = screen.getByRole('button', { name: /Choose Class/i });
        expect(nextButton).toBeEnabled();
    });
});
