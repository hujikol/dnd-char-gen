'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Character } from '@/lib/stores/useCharacterStore';
import { SpellBrowser } from './SpellBrowser';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { CastSpellDialog } from './CastSpellDialog';
import { toast } from 'sonner';
// import { SpellDetailSheet } from './SpellDetailSheet';
import { WikiLink } from '@/components/wiki/WikiLink';

interface SpellListProps {
    spells: Character['spells'];
    slots: Record<number, { max: number; current: number }>;
    onConsumeSlot: (level: number) => void;
    onUpdate: (spells: Character['spells']) => void;
}

export function SpellList({ spells = [], slots = {}, onConsumeSlot, onUpdate }: SpellListProps) {

    const [showPreparedOnly, setShowPreparedOnly] = useState(false);

    const handleAddSpell = (spell: any) => {
        onUpdate([...spells, spell]);
    };

    const handleRemoveSpell = (spellName: string) => {
        if (confirm(`Remove ${spellName}?`)) {
            onUpdate(spells.filter(s => s.name !== spellName));
        }
    };

    const togglePrepared = (spellName: string) => {
        onUpdate(spells.map(s =>
            s.name === spellName ? { ...s, prepared: !s.prepared } : s
        ));
    };

    // Filter spells if needed (cantrips are always prepared/known)
    const visibleSpells = spells.filter(s => {
        if (!showPreparedOnly) return true;
        if (s.level === 0) return true; // Cantrips always show
        return s.prepared;
    });

    // Group spells by level
    const spellsByLevel = visibleSpells.reduce((acc, spell) => {
        const level = spell.level || 0;
        if (!acc[level]) acc[level] = [];
        acc[level].push(spell);
        return acc;
    }, {} as Record<number, typeof spells>);

    const levels = Object.keys(spellsByLevel || {})
        .map(Number)
        .sort((a, b) => a - b);

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-col gap-4 pb-2">
                <div className="flex flex-row items-center justify-between">
                    <CardTitle className="font-heading text-lg">Spellbook</CardTitle>
                    <SpellBrowser
                        onAddSpell={handleAddSpell}
                        knownSpells={spells?.map(s => s.name) || []}
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <Switch id="prepared-mode" checked={showPreparedOnly} onCheckedChange={setShowPreparedOnly} />
                    <Label htmlFor="prepared-mode" className="text-sm font-medium leading-none cursor-pointer">
                        Prepared Spells Only
                    </Label>
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-4">
                {levels.length === 0 && (
                    <div className="text-sm text-muted-foreground italic text-center py-8">
                        {showPreparedOnly ? "No prepared spells found." : "No known spells. Add some!"}
                    </div>
                )}
                {levels.map(level => (
                    <div key={level}>
                        <h3 className="text-sm font-bold uppercase text-muted-foreground border-b mb-2 pb-1">
                            {level === 0 ? "Cantrips" : `Level ${level}`}
                        </h3>
                        <div className="grid gap-2">
                            {spellsByLevel[level]?.map(spell => {
                                const isPrepared = !!spell.prepared;
                                // Visual distinction: Prepared spells (if not filtered) get a background
                                const isActive = isPrepared || spell.level === 0;

                                return (
                                    <div
                                        key={spell.name}
                                        className={cn(
                                            "flex justify-between items-center p-2 rounded-md transition-colors group border border-transparent",
                                            isActive ? "bg-primary/10 border-primary/20" : "hover:bg-accent/50"
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            {spell.level > 0 && (
                                                <div
                                                    className={cn(
                                                        "h-4 w-4 rounded-full border border-primary/50 flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors",
                                                        isPrepared ? "bg-primary border-primary" : "bg-transparent"
                                                    )}
                                                    onClick={(e) => { e.stopPropagation(); togglePrepared(spell.name); }}
                                                    title={isPrepared ? "Prepared" : "Prepare Spell"}
                                                >
                                                    {isPrepared && <div className="h-1.5 w-1.5 bg-primary-foreground rounded-full" />}
                                                </div>
                                            )}

                                            <WikiLink
                                                type="spell"
                                                entity={spell.name}
                                                className={cn("font-medium", !isActive && "text-muted-foreground")}
                                            >
                                                {spell.name}
                                            </WikiLink>
                                            {spell.ritual && (
                                                <Badge variant="secondary" className="text-[10px] h-4 px-1 rounded-sm" title="Ritual">R</Badge>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div onClick={e => e.stopPropagation()}>
                                                {spell.level === 0 ? (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-6 text-[10px] px-2 opacity-50 group-hover:opacity-100 hover:bg-primary hover:text-primary-foreground"
                                                        onClick={() => toast.success(`Casting Cantrip: ${spell.name}`)}
                                                    >
                                                        Cast
                                                    </Button>
                                                ) : (
                                                    <CastSpellDialog
                                                        spellName={spell.name}
                                                        spellLevel={spell.level}
                                                        slots={slots}
                                                        onConsumeSlot={onConsumeSlot}
                                                        trigger={
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-6 text-[10px] px-2 opacity-50 group-hover:opacity-100 hover:bg-primary hover:text-primary-foreground"
                                                            >
                                                                Cast
                                                            </Button>
                                                        }
                                                    />
                                                )}
                                            </div>

                                            <WikiLink
                                                type="spell"
                                                entity={spell.name}
                                                className="no-underline"
                                            >
                                                <Badge variant="outline" className="text-[10px] h-5 opacity-50 group-hover:opacity-100 cursor-pointer hover:bg-secondary">
                                                    Details
                                                </Badge>
                                            </WikiLink>

                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleRemoveSpell(spell.name); }}
                                                className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 px-2"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
