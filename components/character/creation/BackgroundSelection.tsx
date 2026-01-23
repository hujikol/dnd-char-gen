'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { getAllBackgrounds } from '@/lib/db/queries';
import { useCharacterStore } from '@/lib/stores/useCharacterStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface BackgroundSelectionProps {
    onNext: () => void;
    onBack: () => void;
}

export function BackgroundSelection({ onNext, onBack }: BackgroundSelectionProps) {
    const backgrounds = useLiveQuery(getAllBackgrounds);
    const { character, updateCharacter } = useCharacterStore();
    const [selectedBackground, setSelectedBackground] = useState<string>("");

    useEffect(() => {
        if (character?.background) {
            setSelectedBackground(character.background);
        }
    }, [character?.background]);

    if (!backgrounds) {
        return <div className="text-muted-foreground">Loading backgrounds...</div>;
    }

    const handleSelect = (bgName: string) => {
        setSelectedBackground(bgName);
        updateCharacter({ background: bgName });
    };

    const handleConfirm = () => {
        if (selectedBackground) {
            onNext();
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-heading font-bold text-foreground">Choose a Background</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {backgrounds.map((bg) => (
                    <Card
                        key={bg.name}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${selectedBackground === bg.name
                                ? 'border-primary ring-1 ring-primary bg-primary/5 shadow-md'
                                : 'border-border hover:border-primary/50'
                            }`}
                        onClick={() => handleSelect(bg.name)}
                    >
                        <CardHeader className="pb-2">
                            <CardTitle className="font-heading text-lg">{bg.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
                                {bg.data?.description || "No description available."}
                            </p>
                            {bg.data?.skillProficiencies && (
                                <div className="text-xs text-muted-foreground">
                                    <span className="font-semibold text-foreground">Skills: </span>
                                    {bg.data.skillProficiencies.join(", ")}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t border-border flex justify-between container mx-auto md:relative md:bg-transparent md:border-none md:p-0">
                <Button variant="outline" onClick={onBack} size="lg" className="w-[45%] md:w-auto hidden md:inline-flex">
                    Back
                </Button>
                <Button variant="outline" onClick={onBack} size="lg" className="w-[45%] md:w-auto md:hidden">
                    Back
                </Button>

                <Button
                    onClick={handleConfirm}
                    disabled={!selectedBackground}
                    size="lg"
                    className="w-[45%] md:w-auto font-heading font-bold"
                >
                    Next: Abilities
                </Button>
            </div>
        </div>
    );
}
