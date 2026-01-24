"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { getAllSpells } from "@/lib/db/queries";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function SpellList() {
    const spells = useLiveQuery(() => getAllSpells());
    const [search, setSearch] = useState("");
    const [level, setLevel] = useState<string>("all");
    const [school, setSchool] = useState<string>("all");
    const [charClass, setCharClass] = useState<string>("all");

    if (!spells) return <div className="p-4 text-center">Loading spells...</div>;

    const filteredSpells = spells.filter((spell) => {
        const matchesSearch = spell.name.toLowerCase().includes(search.toLowerCase());
        const matchesLevel = level === "all" ? true : spell.level === parseInt(level);
        const matchesSchool = school === "all" ? true : (spell.data?.school?.name || spell.data?.school) === school;
        const matchesClass = charClass === "all" ? true : spell.classes.some(c => c.toLowerCase() === charClass.toLowerCase());

        return matchesSearch && matchesLevel && matchesSchool && matchesClass;
    });

    const schools = [
        "Abjuration", "Conjuration", "Divination", "Enchantment",
        "Evocation", "Illusion", "Necromancy", "Transmutation"
    ];

    const classes = [
        "Barbarian", "Bard", "Cleric", "Druid", "Fighter",
        "Monk", "Paladin", "Ranger", "Rogue", "Sorcerer",
        "Warlock", "Wizard"
    ];

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input
                    placeholder="Search spells..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger>
                        <SelectValue placeholder="Level" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="0">Cantrip</SelectItem>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((l) => (
                            <SelectItem key={l} value={l.toString()}>
                                Level {l}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={school} onValueChange={setSchool}>
                    <SelectTrigger>
                        <SelectValue placeholder="School" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Schools</SelectItem>
                        {schools.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>

                <Select value={charClass} onValueChange={setCharClass}>
                    <SelectTrigger>
                        <SelectValue placeholder="Class" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        {classes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-1 gap-2">
                {filteredSpells.map((spell) => (
                    <Card key={spell.name} className="hover:bg-muted/50 cursor-pointer transition-colors">
                        <CardHeader className="py-3 px-4">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-base font-medium">{spell.name}</CardTitle>
                                <Badge variant="outline" className="font-mono text-xs">
                                    {spell.level === 0 ? "Cantrip" : `Level ${spell.level}`}
                                </Badge>
                            </div>
                        </CardHeader>
                    </Card>
                ))}
            </div>
            {filteredSpells.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No spells found.</p>
            )}
        </div>
    );
}
