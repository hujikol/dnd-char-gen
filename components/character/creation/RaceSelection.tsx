'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { getAllRaces } from '@/lib/db/queries';
import { useCharacterStore } from '@/lib/stores/useCharacterStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface RaceSelectionProps {
    onNext: () => void;
}

export function RaceSelection({ onNext }: RaceSelectionProps) {
    const races = useLiveQuery(getAllRaces);
    const { character, updateCharacter } = useCharacterStore();
    const [selectedRace, setSelectedRace] = useState<string>("");

    useEffect(() => {
        if (character?.race) {
            setSelectedRace(character.race);
        }
    }, [character?.race]);

    if (!races) {
        return <div className="text-muted-foreground">Loading races...</div>;
    }

    const handleSelect = (raceName: string) => {
        setSelectedRace(raceName);
        updateCharacter({ race: raceName });
    };

    const handleConfirm = () => {
        if (selectedRace) {
            onNext();
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-heading font-bold text-foreground">Choose a Race</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {races.map((race) => (
                    <Card
                        key={race.name}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${selectedRace === race.name
                                ? 'border-primary ring-1 ring-primary bg-primary/5 shadow-md'
                                : 'border-border hover:border-primary/50'
                            }`}
                        onClick={() => handleSelect(race.name)}
                    >
                        <CardHeader className="pb-2">
                            <CardTitle className="font-heading text-lg">{race.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Select to choose {race.name} as your race.</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t border-border flex justify-end container mx-auto md:relative md:bg-transparent md:border-none md:p-0">
                <Button
                    onClick={handleConfirm}
                    disabled={!selectedRace}
                    size="lg"
                    className="w-full md:w-auto font-heading font-bold"
                >
                    Next: Choose Class
                </Button>
            </div>
        </div>
    );
}
