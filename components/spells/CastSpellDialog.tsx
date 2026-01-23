'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Zap } from 'lucide-react';
import { toast } from 'sonner';

interface CastSpellDialogProps {
    spellName: string;
    spellLevel: number;
    slots: Record<number, { max: number; current: number }>;
    onConsumeSlot: (level: number) => void;
    trigger: React.ReactNode;
}

export function CastSpellDialog({ spellName, spellLevel, slots, onConsumeSlot, trigger }: CastSpellDialogProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Find valid casting levels (spellLevel and up)
    const validLevels = Object.entries(slots)
        .map(([lvl, slot]) => ({ level: parseInt(lvl), ...slot }))
        .filter(slot => slot.level >= spellLevel && slot.max > 0)
        .sort((a, b) => a.level - b.level);

    const handleCast = (level: number) => {
        if (slots[level].current > 0) {
            onConsumeSlot(level);
            toast.success(`Cast ${spellName} at Level ${level}!`, {
                description: "Spell slot consumed."
            });
            setIsOpen(false);
        } else {
            toast.error("No slots available at this level!");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="font-heading flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        Cast {spellName}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                    <p className="text-sm text-muted-foreground">
                        Select a spell slot level to cast this spell.
                        {spellLevel > 0 && " Casting at a higher level may improve the spell's effects."}
                    </p>

                    <div className="grid gap-2">
                        {validLevels.map(slot => (
                            <Button
                                key={slot.level}
                                variant="outline"
                                className="justify-between h-auto py-3 relative"
                                disabled={slot.current === 0}
                                onClick={() => handleCast(slot.level)}
                            >
                                <div className="flex flex-col items-start">
                                    <span className="font-bold">Level {slot.level} Slot</span>
                                    {slot.level > spellLevel && (
                                        <span className="text-[10px] text-yellow-600 font-bold uppercase tracking-wider">Upcast</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant={slot.current > 0 ? "default" : "secondary"}>
                                        {slot.current} / {slot.max} Available
                                    </Badge>
                                </div>
                            </Button>
                        ))}

                        {validLevels.length === 0 && (
                            <div className="text-center p-4 border rounded bg-destructive/10 text-destructive">
                                No spell slots available to cast this spell!
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
