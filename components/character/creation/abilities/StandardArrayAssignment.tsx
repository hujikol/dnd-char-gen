'use client';

import { useCharacterStore } from '@/lib/stores/useCharacterStore';
import { ABILITY_SCORES, STANDARD_ARRAY } from '@/lib/utils/ability-score-rules';
import { calculateModifier } from '@/lib/utils/calculate-modifier';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

export function StandardArrayAssignment() {
    const { character, updateAbilityScore } = useCharacterStore();

    if (!character) return null;

    const scores = character.abilityScores;

    // Calculate which values from standard array are already used
    const usedValues = Object.values(scores).filter(val => STANDARD_ARRAY.includes(val));

    const handleValueChange = (ability: string, valueStr: string) => {
        const value = parseInt(valueStr);

        // Check if value is already used by another ability (swap logic or simple overwrite?)
        // Simple logic: just set it. The user has to manually ensure uniqueness for now, 
        // or we can implement a swap. Let's do a smart swap if that value is taken.
        // Actually, sticking to simple assignment first to satisfy basic requirement. 
        // Wait, Standard Array requires UNIQUE assignment of [15, 14, 13, 12, 10, 8].

        // Let's implement a swap: Find who has this value, give them my old value? 
        // Or just clear them? Swap is better UX.
        const oldScore = scores[ability];

        // Find ability with the new value
        const abilityWithNewValue = Object.entries(scores).find(([k, v]) => v === value)?.[0];

        if (abilityWithNewValue && abilityWithNewValue !== ability) {
            // Swap
            updateAbilityScore(abilityWithNewValue, oldScore);
        }

        updateAbilityScore(ability, value);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ABILITY_SCORES.map((ability) => {
                const score = scores[ability];
                const modifier = calculateModifier(score);
                const displayMod = modifier >= 0 ? `+${modifier}` : modifier;

                return (
                    <Card key={ability} className="bg-card">
                        <CardContent className="p-4 flex flex-col items-center space-y-3">
                            <h3 className="text-lg font-heading font-bold uppercase tracking-wider">{ability}</h3>

                            <Select value={score.toString()} onValueChange={(val) => handleValueChange(ability, val)}>
                                <SelectTrigger className="w-[100px] text-center font-bold">
                                    <SelectValue placeholder="-" />
                                </SelectTrigger>
                                <SelectContent>
                                    {STANDARD_ARRAY.map((val) => (
                                        <SelectItem key={val} value={val.toString()}>
                                            {val}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <div className="w-full pt-3 border-t border-border/10 text-center">
                                <span className="text-sm text-muted-foreground uppercase mr-2">Modifier</span>
                                <span className="font-bold text-foreground bg-primary/20 px-2 py-0.5 rounded text-sm">{displayMod}</span>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}

            <div className="md:col-span-3 text-center text-sm text-muted-foreground mt-4">
                Assign each standard value (15, 14, 13, 12, 10, 8) to one ability.
                <br />
                (Values automatically swap if you select a taken one)
            </div>
        </div>
    );
}
