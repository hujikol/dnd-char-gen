'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Coffee, Dna } from 'lucide-react';
import { Character } from '@/lib/stores/useCharacterStore';
import { calculateModifier } from '@/lib/utils/calculate-modifier';
import { toast } from 'sonner';

interface ShortRestDialogProps {
    character: Character;
    onUpdate: (updates: Partial<Character>) => void;
}

export function ShortRestDialog({ character, onUpdate }: ShortRestDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [diceToSpend, setDiceToSpend] = useState<number>(0);

    // Safely parse die type (e.g., "d8" -> 8)
    const dieType = parseInt(character.hitDice.die.replace('d', '')) || 8;
    const conMod = calculateModifier(character.abilityScores.con || 10);
    const maxDice = character.hitDice.current;

    const handleShortRest = () => {
        let hpRecovered = 0;
        let rollLog: number[] = [];

        // Roll Hit Dice
        for (let i = 0; i < diceToSpend; i++) {
            const roll = Math.floor(Math.random() * dieType) + 1;
            const total = Math.max(0, roll + conMod); // Min 0 healing? Rules say minimum 0 usually, but raw checks can be negative. 5e usually min 0 or 1 total? RAW: "add your Constitution modifier", no default minimum stated, but healing usually non-negative. Let's assume min 0.
            hpRecovered += total;
            rollLog.push(total);
        }

        const newCurrentHP = Math.min(character.hp.max, character.hp.current + hpRecovered);
        const newHitDiceCurrent = Math.max(0, character.hitDice.current - diceToSpend);

        const updates: Partial<Character> = {
            hp: {
                ...character.hp,
                current: newCurrentHP
            },
            hitDice: {
                ...character.hitDice,
                current: newHitDiceCurrent
            }
        };

        // Recover Pact Slots (Warlock)
        if (character.pactSlots) {
            updates.pactSlots = {
                ...character.pactSlots,
                current: character.pactSlots.max
            };
        }

        onUpdate(updates);
        setIsOpen(false);
        setDiceToSpend(0);

        // Toast feedback
        let description = "Rest complete.";
        if (diceToSpend > 0) {
            description = `Recovered ${hpRecovered} HP (${rollLog.length}d${dieType}${conMod >= 0 ? '+' : ''}${conMod}).`;
        }
        if (character.pactSlots) {
            description += " Pact slots restored.";
        }
        toast.success("Short Rest Completed", { description });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Coffee className="w-4 h-4 mr-2" />
                    Short Rest
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Short Rest</DialogTitle>
                    <DialogDescription>
                        Take a breather. Spend Hit Dice to regain health, and refresh short-rest abilities (like Pact Magic).
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Label>Hit Dice Available</Label>
                            <div className="text-sm text-muted-foreground">
                                You have <span className="font-bold text-foreground">{character.hitDice.current}</span> / {character.hitDice.max} ({character.hitDice.die})
                            </div>
                        </div>
                        <Dna className="h-8 w-8 text-muted-foreground/30" />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="spend-dice" className="col-span-2">
                            Spend Dice
                        </Label>
                        <Input
                            id="spend-dice"
                            type="number"
                            min="0"
                            max={maxDice}
                            value={diceToSpend}
                            onChange={(e) => setDiceToSpend(Math.min(maxDice, Math.max(0, parseInt(e.target.value) || 0)))}
                            className="col-span-2 text-right"
                            disabled={maxDice === 0}
                        />
                    </div>

                    {diceToSpend > 0 && (
                        <div className="text-sm text-muted-foreground text-center bg-muted/50 p-2 rounded">
                            Estimated Recovery: {diceToSpend}d{dieType} {conMod >= 0 ? '+' : ''}{conMod * diceToSpend} HP
                        </div>
                    )}

                    {character.pactSlots && (
                        <div className="text-sm text-indigo-400 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                            Warlock Pact Slots will be restored.
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleShortRest}>Confirm Rest</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
