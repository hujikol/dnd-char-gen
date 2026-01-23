'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateModifier } from '@/lib/utils/calculate-modifier';
import { useDiceStore } from '@/lib/stores/useDiceStore';
import { rollD20 } from '@/lib/dice/engine';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Shuffle } from 'lucide-react';

interface SavingThrowListProps {
    abilityScores: Record<string, number>;
    proficiencyBonus: number;
    proficiencies: string[];
    onUpdate: (saves: string[]) => void;
    characterId: number;
}

const ABILITIES = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

export function SavingThrowList({ abilityScores, proficiencyBonus, proficiencies = [], onUpdate, characterId }: SavingThrowListProps) {
    const { triggerRoll } = useDiceStore();

    const toggleProficiency = (ability: string) => {
        if (proficiencies.includes(ability)) {
            onUpdate(proficiencies.filter(s => s !== ability));
        } else {
            onUpdate([...proficiencies, ability]);
        }
    };

    const handleRoll = async (ability: string, modifier: number) => {
        const result = await rollD20(characterId, modifier, `${ability.toUpperCase()} Save`);
        triggerRoll(result, 'd20');
    };

    return (
        <Card className="h-full">
            <CardHeader className="pb-3 pt-4 px-4">
                <CardTitle className="font-heading text-lg flex items-center gap-2">
                    <Shuffle className="h-4 w-4" /> Saving Throws
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2 px-2 pb-4">
                {ABILITIES.map((ability) => {
                    const isProficient = proficiencies.includes(ability);
                    const abilityScore = abilityScores[ability] || 10;
                    const abilityMod = calculateModifier(abilityScore);
                    const totalMod = abilityMod + (isProficient ? proficiencyBonus : 0);

                    return (
                        <div
                            key={ability}
                            className={cn(
                                "flex flex-col items-center justify-center p-2 rounded-md hover:bg-accent/50 transition-colors cursor-pointer border",
                                isProficient ? "bg-primary/5 border-primary/40" : "border-transparent bg-secondary/20"
                            )}
                            onClick={() => handleRoll(ability, totalMod)}
                        >
                            <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">{ability}</div>
                            <div className="font-mono text-xl font-bold">
                                {totalMod >= 0 ? `+${totalMod}` : totalMod}
                            </div>
                            <div
                                className={cn(
                                    "mt-1 h-2 w-2 rounded-full border border-primary/50",
                                    isProficient && "bg-primary border-primary"
                                )}
                                onClick={(e) => { e.stopPropagation(); toggleProficiency(ability); }}
                            />
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
