'use client';

import { useCharacterStore } from '@/lib/stores/useCharacterStore';
import { calculatePointBuyCost, getTotalPointsSpent, ABILITY_SCORES } from '@/lib/utils/ability-score-rules';
import { calculateModifier } from '@/lib/utils/calculate-modifier';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Minus } from 'lucide-react';

const MAX_POINTS = 27;

export function PointBuyCalculator() {
    const { character, updateAbilityScore } = useCharacterStore();

    if (!character) return null;

    const scores = character.abilityScores;
    const pointsSpent = getTotalPointsSpent(scores);
    const remainingPoints = MAX_POINTS - pointsSpent;

    const handleIncrement = (ability: string) => {
        const currentScore = scores[ability];
        if (currentScore >= 15) return;

        const nextScore = currentScore + 1;
        const costDiff = calculatePointBuyCost(nextScore) - calculatePointBuyCost(currentScore);

        if (remainingPoints >= costDiff) {
            updateAbilityScore(ability, nextScore);
        }
    };

    const handleDecrement = (ability: string) => {
        const currentScore = scores[ability];
        if (currentScore <= 8) return;
        updateAbilityScore(ability, currentScore - 1);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center text-sm md:text-base border-b border-border pb-4">
                <span>Total Points: <span className="font-bold text-primary">{MAX_POINTS}</span></span>
                <span>Remaining: <span className={`font-bold ${remainingPoints < 0 ? 'text-destructive' : 'text-primary'}`}>{remainingPoints}</span></span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ABILITY_SCORES.map((ability) => {
                    const score = scores[ability];
                    const cost = calculatePointBuyCost(score);
                    const modifier = calculateModifier(score);
                    const displayMod = modifier >= 0 ? `+${modifier}` : modifier;

                    return (
                        <Card key={ability} className="bg-card">
                            <CardContent className="p-4 flex flex-col items-center space-y-3">
                                <h3 className="text-lg font-heading font-bold uppercase tracking-wider">{ability}</h3>

                                <div className="flex items-center space-x-4">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 rounded-full"
                                        onClick={() => handleDecrement(ability)}
                                        disabled={score <= 8}
                                        aria-label={`Decrease ${ability}`}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>

                                    <div className="text-center">
                                        <div className="text-3xl font-bold font-mono">{score}</div>
                                        <div className="text-xs text-muted-foreground mt-1">Cost: {cost}</div>
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 rounded-full"
                                        onClick={() => handleIncrement(ability)}
                                        disabled={score >= 15 || remainingPoints < (calculatePointBuyCost(score + 1) - calculatePointBuyCost(score))}
                                        aria-label={`Increase ${ability}`}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="w-full pt-3 border-t border-border/10 text-center">
                                    <span className="text-sm text-muted-foreground uppercase mr-2">Modifier</span>
                                    <span className="font-bold text-foreground bg-primary/20 px-2 py-0.5 rounded text-sm">{displayMod}</span>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
