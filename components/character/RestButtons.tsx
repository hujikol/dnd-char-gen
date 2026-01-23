'use client';

import { Button } from "@/components/ui/button";
import { Moon } from "lucide-react";
import { toast } from "sonner";
import { Character } from "@/lib/stores/useCharacterStore";

interface LongRestButtonProps {
    characterData: Character;
    onUpdate: (updates: Partial<Character>) => void;
}

export function LongRestButton({ characterData, onUpdate }: LongRestButtonProps) {
    const handleLongRest = () => {
        // Confirmation dialog might be annoying for quick testing, but good for UX. 
        // Using window.confirm for simplicity, or we could use an AlertDialog.
        // For a PWA, a simple confirm is okay, but a custom dialog is better. 
        // I'll stick to logic execution first.

        const hpMax = characterData.hp.max;
        const hitDiceMax = characterData.hitDice.max;
        const currentHitDice = characterData.hitDice.current;

        // Recover half of total hit dice, min 1
        // Note: hitDiceMax is usually equal to Level. If multi-class, it sum of hit dice.
        // Assuming hitDice.max tracks total hit dice available.
        const recoverHitDice = Math.max(1, Math.floor(hitDiceMax / 2));
        const newHitDiceCurrent = Math.min(hitDiceMax, currentHitDice + recoverHitDice);

        const updates: Partial<Character> = {
            hp: {
                ...characterData.hp,
                current: hpMax,
                temp: 0
            },
            hitDice: {
                ...characterData.hitDice,
                current: newHitDiceCurrent
            },
            deathSaves: {
                successes: 0,
                failures: 0
            }
        };

        // Restore Spell Slots
        if (characterData.spellSlots) {
            const newSpellSlots = { ...characterData.spellSlots };
            Object.keys(newSpellSlots).forEach(level => {
                const lvl = parseInt(level);
                if (newSpellSlots[lvl]) {
                    newSpellSlots[lvl] = {
                        ...newSpellSlots[lvl],
                        current: newSpellSlots[lvl].max
                    };
                }
            });
            updates.spellSlots = newSpellSlots;
        }

        // Restore Pact Slots
        if (characterData.pactSlots) {
            updates.pactSlots = {
                ...characterData.pactSlots,
                current: characterData.pactSlots.max
            };
        }

        onUpdate(updates);
        toast.success("Long Rest Completed", { description: "HP, Spell Slots, and Hit Dice restored." });
    };

    return (
        <Button variant="outline" size="sm" onClick={handleLongRest}>
            <Moon className="w-4 h-4 mr-2" />
            Long Rest
        </Button>
    )
}
