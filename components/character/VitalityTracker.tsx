'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Heart, Activity, Skull, Shield, Plus, Minus } from 'lucide-react';
import { Character } from '@/lib/stores/useCharacterStore';

interface VitalityTrackerProps {
    hp: Character['hp'];
    hitDice: Character['hitDice'];
    deathSaves: Character['deathSaves'];
    onUpdate: (data: any) => void;
}

export function VitalityTracker({ hp, hitDice, deathSaves, onUpdate }: VitalityTrackerProps) {

    const updateHP = (key: keyof typeof hp, value: number) => {
        const newHP = { ...hp, [key]: value };
        onUpdate({ hp: newHP });
    };

    const updateHitDice = (key: keyof typeof hitDice, value: any) => {
        const newHitDice = { ...hitDice, [key]: value };
        onUpdate({ hitDice: newHitDice });
    };

    const updateDeathSaves = (key: keyof typeof deathSaves, value: number) => {
        const newDeathSaves = { ...deathSaves, [key]: value };
        onUpdate({ deathSaves: newDeathSaves });
    };

    // Helper to handle HP change safely
    const handleHPChange = (amount: number) => {
        const newCurrent = Math.min(hp.max, Math.max(0, hp.current + amount));
        updateHP('current', newCurrent);
    };

    const hpPercentage = Math.min(100, Math.max(0, (hp.current / hp.max) * 100));

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 font-heading text-lg">
                    <Heart className="h-5 w-5 text-red-500" />
                    Vitality
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* HP Section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <div>
                            <Label className="text-xs text-muted-foreground uppercase font-bold">Current HP</Label>
                            <div className="text-4xl font-bold font-mono leading-none flex items-baseline gap-2">
                                {hp.current}
                                <span className="text-sm text-muted-foreground font-sans font-normal">/ {hp.max}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <Label className="text-xs text-muted-foreground uppercase font-bold">Temp HP</Label>
                            <Input
                                type="number"
                                value={hp.temp || ''}
                                onChange={(e) => updateHP('temp', parseInt(e.target.value) || 0)}
                                className="w-16 h-8 text-right font-mono"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <Progress value={hpPercentage} className="h-2" indicatorClassName={hpPercentage < 20 ? "bg-red-600" : (hpPercentage < 50 ? "bg-yellow-500" : "bg-green-500")} />

                    <div className="flex justify-between gap-2">
                        <div className="flex gap-1">
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleHPChange(-1)}>-1</Button>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleHPChange(-5)}>-5</Button>
                        </div>
                        <div className="flex gap-1">
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleHPChange(1)}>+1</Button>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleHPChange(5)}>+5</Button>
                        </div>
                    </div>
                </div>

                <div className="border-t pt-4 grid grid-cols-2 gap-4">

                    {/* Hit Dice Section */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-xs text-muted-foreground uppercase font-bold">
                            <Shield className="h-3 w-3" /> Hit Dice ({hitDice.die})
                        </Label>
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-mono font-bold">{hitDice.current} <span className="text-sm text-muted-foreground">/ {hitDice.max}</span></span>
                        </div>
                        <div className="flex gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs w-full"
                                disabled={hitDice.current <= 0}
                                onClick={() => updateHitDice('current', Math.max(0, hitDice.current - 1))}
                            >
                                Use
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs w-full"
                                disabled={hitDice.current >= hitDice.max}
                                onClick={() => updateHitDice('current', Math.min(hitDice.max, hitDice.current + 1))}
                            >
                                Rest
                            </Button>
                        </div>
                    </div>

                    {/* Death Saves Section */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-xs text-muted-foreground uppercase font-bold">
                            <Skull className="h-3 w-3" /> Death Saves
                        </Label>

                        <div className="flex items-center justify-between text-xs">
                            <span>Success</span>
                            <div className="flex gap-1">
                                {[1, 2, 3].map((i) => (
                                    <Checkbox
                                        key={`success-${i}`}
                                        checked={deathSaves.successes >= i}
                                        onCheckedChange={(checked) => updateDeathSaves('successes', checked ? i : i - 1)}
                                        className="h-3 w-3 rounded-full data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                            <span>Failure</span>
                            <div className="flex gap-1">
                                {[1, 2, 3].map((i) => (
                                    <Checkbox
                                        key={`fail-${i}`}
                                        checked={deathSaves.failures >= i}
                                        onCheckedChange={(checked) => updateDeathSaves('failures', checked ? i : i - 1)}
                                        className="h-3 w-3 rounded-full data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                                    />
                                ))}
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-[10px] w-full mt-1"
                            onClick={() => onUpdate({ deathSaves: { successes: 0, failures: 0 } })}
                        >
                            Reset
                        </Button>
                    </div>

                </div>
            </CardContent>
        </Card>
    );
}
