'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { db } from '@/lib/db/schema';
import { CharacterCard } from '@/components/character/CharacterCard';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
    const characters = useLiveQuery(() => db.characters.toArray());

    return (
        <div className="container mx-auto p-4 md:p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-heading font-bold text-foreground">My Characters</h1>
                <Link href="/character/new">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        New Character
                    </Button>
                </Link>
            </div>

            {!characters ? (
                <div className="flex justify-center py-12">
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            ) : characters.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-border rounded-lg bg-card/50">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Plus className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-heading font-medium mb-2">No Characters Found</h3>
                    <p className="text-muted-foreground text-center max-w-sm mb-6">
                        You haven&apos;t created any characters yet. Start your adventure by creating your first character.
                    </p>
                    <Link href="/character/new">
                        <Button size="lg" className="gap-2">
                            Create Your First Character
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {characters.map((char) => (
                        <CharacterCard key={char.id} character={char} />
                    ))}
                </div>
            )}
        </div>
    );
}
