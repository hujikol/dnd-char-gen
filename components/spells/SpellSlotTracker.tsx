'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Settings } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SpellSlotTrackerProps {
    slots: Record<number, { max: number; current: number }>;
    pactSlots?: { max: number; current: number; level: number };
    onUpdate: (slots: Record<number, { max: number; current: number }>, pact?: { max: number; current: number; level: number }) => void;
}

export function SpellSlotTracker({ slots = {}, pactSlots, onUpdate }: SpellSlotTrackerProps) {
    const spellLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    // Ensure we have entries for relevant levels
    const getSlot = (level: number) => slots[level] || { max: 0, current: 0 };

    const updateSlot = (level: number, changes: Partial<{ max: number; current: number }>) => {
        const currentData = getSlot(level);
        const newData = { ...currentData, ...changes };
        // Validations
        if (newData.current < 0) newData.current = 0;
        if (newData.current > newData.max) newData.current = newData.max;
        if (newData.max < 0) newData.max = 0;

        const newSlots = { ...slots, [level]: newData };
        onUpdate(newSlots, pactSlots);
    };

    const toggleSlot = (level: number, index: number) => {
        const slot = getSlot(level);
        // If clicking a filled slot (index < current), unfill it (reduce current)
        // If clicking an empty slot, fill it (increase current) -- implementation variation
        // Standard D&D: You expend slots. So decreasing 'current' is "using" it.
        // Let's model 'current' as "Available Slots". 
        // Rendering: Show 'max' circles. 'current' number of them are filled.

        // If I click the 3rd circle (index 2), and I have 3 slots... 
        // Let's simpler interaction: Click a slot to toggle its state?
        // Or just +/- buttons? Pips are nicer.

        // Interaction:
        // We render N circles (N=max).
        // First 'current' circles are Filled (Available).
        // The rest are Empty (Expended).
        // Clicking an Available slot expends it (current - 1).
        // Clicking an Expended slot restores it (current + 1).

        if (index < slot.current) {
            updateSlot(level, { current: slot.current - 1 });
        } else {
            updateSlot(level, { current: slot.current + 1 });
        }
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="font-heading text-lg">Spell Slots</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {spellLevels.map(level => {
                    const slot = getSlot(level);
                    if (slot.max === 0) return null; // Hide levels with 0 max slots unless in edit mode? 
                    // For MVP, maybe show all or just non-zero. Let's show non-zero.
                    // But we need a way to SET max.

                    return (
                        <div key={level} className="flex items-center justify-between">
                            <div className="w-8 font-bold text-sm text-muted-foreground">Lvl {level}</div>
                            <div className="flex flex-wrap gap-1 flex-1 justify-end">
                                {Array.from({ length: slot.max }).map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => toggleSlot(level, i)}
                                        className={`h-6 w-6 rounded-full border transition-all ${i < slot.current
                                                ? "bg-primary border-primary hover:bg-primary/80"
                                                : "bg-transparent border-primary/30 hover:bg-primary/10"
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}

                {/* Configuration Popover */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full mt-4">
                            <Settings className="h-4 w-4 mr-2" /> Configure Slots
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <h4 className="font-medium leading-none">Max Spell Slots</h4>
                                <p className="text-sm text-muted-foreground">Set available slots per level.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                                {spellLevels.map(level => (
                                    <div key={level} className="flex items-center gap-2">
                                        <Label className="w-12 text-xs">Lvl {level}</Label>
                                        <Input
                                            type="number"
                                            className="h-7"
                                            value={getSlot(level).max}
                                            onChange={(e) => updateSlot(level, { max: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Placeholder for no slots visible */}
                {Object.values(slots).every(s => s.max === 0) && (
                    <div className="text-sm text-muted-foreground italic text-center">
                        No spell slots configured.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
