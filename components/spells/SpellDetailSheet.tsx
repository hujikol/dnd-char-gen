'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/schema';
import { Separator } from '@/components/ui/separator';

interface SpellDetailSheetProps {
    spellName: string;
    trigger: React.ReactNode;
}

export function SpellDetailSheet({ spellName, trigger }: SpellDetailSheetProps) {
    const spell = useLiveQuery(() => db.spells.get({ name: spellName }), [spellName]);

    return (
        <Sheet>
            <SheetTrigger asChild>
                {trigger}
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader className="mb-4">
                    <SheetTitle className="text-2xl font-heading text-primary">{spellName}</SheetTitle>
                    {spell && (
                        <div className="flex gap-2 text-muted-foreground text-sm italic">
                            <span>Level {spell.level}</span>
                            <span>•</span>
                            <span>{spell.data?.school || "Unknown School"}</span>
                        </div>
                    )}
                </SheetHeader>

                <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
                    {!spell ? (
                        <div className="text-center py-8">Loading details...</div>
                    ) : (
                        <div className="space-y-4">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4 text-sm bg-secondary/20 p-3 rounded-lg border">
                                <div>
                                    <span className="font-bold text-muted-foreground block text-xs uppercase">Casting Time</span>
                                    {spell.data?.casting_time || "N/A"}
                                </div>
                                <div>
                                    <span className="font-bold text-muted-foreground block text-xs uppercase">Range</span>
                                    {spell.data?.range || "N/A"}
                                </div>
                                <div>
                                    <span className="font-bold text-muted-foreground block text-xs uppercase">Components</span>
                                    {spell.data?.components || "N/A"}
                                </div>
                                <div>
                                    <span className="font-bold text-muted-foreground block text-xs uppercase">Duration</span>
                                    {spell.data?.duration || "N/A"}
                                </div>
                            </div>

                            <Separator />

                            {/* Description */}
                            <div className="text-sm leading-relaxed space-y-4">
                                {(spell.data?.description || "No description available.").split('\n').map((line: string, i: number) => (
                                    line === "" ? <br key={i} /> : <p key={i}>{line}</p>
                                ))}
                            </div>

                            {/* Higher Levels */}
                            {spell.data?.higher_levels && (
                                <div className="bg-primary/5 p-3 rounded-lg border border-primary/20 mt-4">
                                    <span className="font-bold text-primary block text-sm mb-1">At Higher Levels</span>
                                    <p className="text-sm italic">{spell.data.higher_levels}</p>
                                </div>
                            )}

                            {/* Classes */}
                            <div className="pt-4 flex flex-wrap gap-2">
                                {spell.classes.map(cls => (
                                    <Badge key={cls} variant="secondary" className="text-[10px]">{cls}</Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
