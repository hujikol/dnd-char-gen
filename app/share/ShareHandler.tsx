"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { decompressCharacter } from "@/lib/utils/share-character";
import { addCharacterToLibrary } from "@/lib/utils/import-character";
import { Character } from "@/lib/stores/useCharacterStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Download, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { calculateModifier } from "@/lib/utils/calculate-modifier";

export function ShareHandler() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const dataString = searchParams.get("data");

    const [character, setCharacter] = useState<Character | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [importing, setImporting] = useState(false);

    useEffect(() => {
        if (!dataString) {
            setError("No character data found in link.");
            return;
        }

        const char = decompressCharacter(dataString);
        if (char) {
            setCharacter(char);
        } else {
            setError("Invalid or corrupted character data.");
        }
    }, [dataString]);

    const handleImport = async () => {
        if (!character) return;
        setImporting(true);
        try {
            const id = await addCharacterToLibrary(character);
            toast.success("Character imported successfully!");
            router.push(`/character/${id}`);
        } catch (e) {
            toast.error("Failed to import character.");
            console.error(e);
            setImporting(false);
        }
    };

    if (error) {
        return (
            <Card className="w-full max-w-md mx-auto mt-10 border-destructive/50">
                <CardHeader>
                    <CardTitle className="text-destructive flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Error
                    </CardTitle>
                    <CardDescription>{error}</CardDescription>
                </CardHeader>
                <CardFooter>
                    <Link href="/dashboard">
                        <Button variant="outline">Go to Dashboard</Button>
                    </Link>
                </CardFooter>
            </Card>
        );
    }

    if (!character) {
        return (
            <div className="flex justify-center mt-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <Card className="w-full max-w-lg mx-auto mt-10">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-heading text-primary">{character.name}</CardTitle>
                <CardDescription className="text-lg">
                    Level {character.level} {character.class} • {character.race}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-6 gap-2 text-center">
                    {Object.entries(character.abilityScores).map(([key, val]) => (
                        <div key={key} className="bg-muted p-2 rounded">
                            <div className="text-xs uppercase font-bold text-muted-foreground">{key}</div>
                            <div className="font-mono font-bold">{val}</div>
                            <div className="text-xs">{calculateModifier(val) >= 0 ? '+' : ''}{calculateModifier(val)}</div>
                        </div>
                    ))}
                </div>
                {/* Potentially show subclass or other details if available */}
            </CardContent>
            <CardFooter className="flex justify-between gap-4">
                <Link href="/dashboard" className="w-full">
                    <Button variant="outline" className="w-full">Cancel</Button>
                </Link>
                <Button onClick={handleImport} disabled={importing} className="w-full gap-2">
                    {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    Import Character
                </Button>
            </CardFooter>
        </Card>
    );
}
