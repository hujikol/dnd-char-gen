'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/schema';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { calculateModifier } from '@/lib/utils/calculate-modifier';
import Link from 'next/link';

interface CharacterSheetProps {
    id: number;
}

export function CharacterSheet({ id }: CharacterSheetProps) {
    const character = useLiveQuery(() => db.characters.get(id), [id]);

    if (character === undefined) return <div>Loading...</div>;
    if (character === null) return <div>Character not found</div>;

    // Type assertion or safe access since database schema 'data' is any.
    // Ideally, use a Zod schema to parse 'data'. For now, manual access.
    const { race, background } = character;
    const abilityScores = character.data?.abilityScores || character.data?.stats || {};
    const description = character.data?.description || "";

    // Safe default for ability scores if they don't exist yet
    const scores = {
        str: abilityScores.str ?? 10,
        dex: abilityScores.dex ?? 10,
        con: abilityScores.con ?? 10,
        int: abilityScores.int ?? 10,
        wis: abilityScores.wis ?? 10,
        cha: abilityScores.cha ?? 10,
    }

    return (
        <div className="space-y-6 pb-24">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-heading font-bold text-primary">{character.name}</h1>
                    <div className="text-lg text-muted-foreground flex items-center gap-2">
                        <span>Level {character.level} {character.class}</span>
                        <span>•</span>
                        <span>{race}</span>
                        <span>•</span>
                        <span>{background}</span>
                    </div>
                </div>
                <Link href="/dashboard">
                    <Button variant="outline">Close</Button>
                </Link>
            </div>

            {/* Ability Scores */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {Object.entries(scores).map(([ability, score]) => {
                    const modifier = calculateModifier(score as number);
                    const displayMod = modifier >= 0 ? `+${modifier}` : modifier;
                    return (
                        <Card key={ability} className="bg-card text-center">
                            <CardContent className="p-3">
                                <div className="text-xs text-muted-foreground uppercase font-bold">{ability}</div>
                                <div className="text-2xl font-bold font-mono my-1">{score as number}</div>
                                <div className="bg-primary/20 rounded px-1 py-0.5 text-sm font-bold inline-block min-w-[30px]">
                                    {displayMod}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Features Placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="font-heading">Class Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground italic">No features yet.</p>
                    </CardContent>
                </Card>

                <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="font-heading">Proficiencies</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground italic">No proficiencies yet.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
