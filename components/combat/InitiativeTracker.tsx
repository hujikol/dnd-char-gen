'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Zap } from 'lucide-react';
import { calculateModifier } from '@/lib/utils/calculate-modifier';
import { rollD20 } from '@/lib/dice/engine';
import { useDiceStore } from '@/lib/stores/useDiceStore';

interface InitiativeTrackerProps {
    dexScore: number;
    initiative: number;
    onUpdate: (val: number) => void;
    characterId: number;
}

export function InitiativeTracker({ dexScore, initiative, onUpdate, characterId }: InitiativeTrackerProps) {
    const { triggerRoll } = useDiceStore();
    const dexMod = calculateModifier(dexScore);

    const handleRoll = async () => {
        const result = await rollD20(characterId, dexMod, "Initiative Roll");
        triggerRoll(result, 'd20');
        onUpdate(result.total);
    };

    return (
        <Card>
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-yellow-500/20 p-2 rounded-full">
                        <Zap className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground uppercase font-bold">Initiative</div>
                        <div className="text-sm text-muted-foreground">Dex {dexMod >= 0 ? `+${dexMod}` : dexMod}</div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Input
                        type="number"
                        value={initiative ?? ''}
                        onChange={(e) => onUpdate(parseInt(e.target.value) || 0)}
                        className="w-16 h-10 text-xl font-bold font-mono text-center"
                        placeholder="-"
                    />
                    <Button onClick={handleRoll} variant="default" size="default">Roll</Button>
                </div>
            </CardContent>
        </Card>
    );
}
