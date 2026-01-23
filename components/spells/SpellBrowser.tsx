'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/schema';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Search, Plus, BookOpen } from 'lucide-react';
import { Character } from '@/lib/stores/useCharacterStore';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SpellBrowserProps {
    onAddSpell: (spell: any) => void;
    knownSpells: string[]; // List of spell names already known
}

export function SpellBrowser({ onAddSpell, knownSpells }: SpellBrowserProps) {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    // In a real app, this query would be optimized or paginated.
    // For Dexie ~500 items is fine to filter in memory after fetch or mostly indexed query.
    // Let's rely on basic array filtering for simplicity in this MVP step if Dexie query gets complex.
    const spells = useLiveQuery(
        async () => {
            const all = await db.spells.toArray();
            if (!search) return all.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
            const lowerSearch = search.toLowerCase();
            return all.filter(s => s.name.toLowerCase().includes(lowerSearch));
        },
        [search]
    );

    const handleAdd = (spell: any) => {
        onAddSpell({
            name: spell.name,
            level: spell.level,
            school: spell.school || "Unknown",
            ritual: spell.data?.ritual || false,
            source: "SRD"
        });
        setIsOpen(false);
        setSearch('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" /> Add Spell
                </Button>
            </DialogTrigger>
            <DialogContent className="h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Spell Browser</DialogTitle>
                </DialogHeader>
                <div className="relative mb-2">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search spells..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-2">
                        {spells?.map(spell => {
                            const isKnown = knownSpells.includes(spell.name);
                            return (
                                <div key={spell.name} className="flex justify-between items-center p-2 border rounded-md hover:bg-accent/50">
                                    <div>
                                        <div className="font-bold">{spell.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                            Level {spell.level} • {spell.classes.join(', ')}
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant={isKnown ? "secondary" : "default"}
                                        disabled={isKnown}
                                        onClick={() => handleAdd(spell)}
                                    >
                                        {isKnown ? "Known" : "Add"}
                                    </Button>
                                </div>
                            )
                        })}
                        {spells?.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">No spells found.</div>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
