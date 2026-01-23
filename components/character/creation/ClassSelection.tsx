'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { getAllClasses } from '@/lib/db/queries';
import { useCharacterStore } from '@/lib/stores/useCharacterStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface ClassSelectionProps {
    onNext: () => void;
    onBack: () => void;
}

export function ClassSelection({ onNext, onBack }: ClassSelectionProps) {
    const classes = useLiveQuery(getAllClasses);
    const { character, updateCharacter } = useCharacterStore();
    const [selectedClass, setSelectedClass] = useState<string>("");

    useEffect(() => {
        if (character?.class) {
            setSelectedClass(character.class);
        }
    }, [character?.class]);

    if (!classes) {
        return <div className="text-muted-foreground">Loading classes...</div>;
    }

    const handleSelect = (className: string) => {
        setSelectedClass(className);
        updateCharacter({ class: className });
    };

    const handleConfirm = () => {
        if (selectedClass) {
            onNext();
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-heading font-bold text-foreground">Choose a Class</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classes.map((cls) => (
                    <Card
                        key={cls.name}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${selectedClass === cls.name
                                ? 'border-primary ring-1 ring-primary bg-primary/5 shadow-md'
                                : 'border-border hover:border-primary/50'
                            }`}
                        onClick={() => handleSelect(cls.name)}
                    >
                        <CardHeader className="pb-2">
                            <CardTitle className="font-heading text-lg">{cls.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground space-y-1">
                                <div className="flex justify-between">
                                    <span>Hit Die</span>
                                    <span className="font-medium text-foreground">d{cls.hitDie}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Primary Ability</span>
                                    <span className="font-medium text-foreground">{cls.primaryAbility}</span>
                                </div>
                            </div>
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
                    disabled={!selectedClass}
                    size="lg"
                    className="w-[45%] md:w-auto font-heading font-bold"
                >
                    Next: Background
                </Button>
            </div>
        </div>
    );
}
