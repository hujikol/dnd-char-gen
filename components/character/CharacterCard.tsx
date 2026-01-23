import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CharacterDB } from '@/lib/db/schema';

interface CharacterCardProps {
    character: CharacterDB;
}

export function CharacterCard({ character }: CharacterCardProps) {
    // Safe access for race in case data is undefined
    const race = character.data?.race || "Unknown Race";

    return (
        <Link href={`/character/${character.id}`} className="block">
            <Card className="hover:border-primary transition-all duration-200 cursor-pointer h-full border-border/50 hover:shadow-md">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-heading text-primary">{character.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex justify-between items-center border-b border-border/10 pb-1">
                            <span>Race</span>
                            <span className="font-medium text-foreground">{race}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-border/10 pb-1">
                            <span>Class</span>
                            <span className="font-medium text-foreground">{character.class}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Level</span>
                            <span className="font-medium text-foreground">{character.level}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
