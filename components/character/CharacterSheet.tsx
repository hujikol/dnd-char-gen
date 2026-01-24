'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/schema';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { calculateModifier } from '@/lib/utils/calculate-modifier';
import Link from 'next/link';
import { VitalityTracker } from './VitalityTracker';
import { AttackList } from '../combat/AttackList';
import { SkillList } from './SkillList';
import { SavingThrowList } from './SavingThrowList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { RollHistoryList } from '../dice/RollHistoryList';
import { History, Download, Share2 } from 'lucide-react';
import { InitiativeTracker } from '../combat/InitiativeTracker';
import { SpellSlotTracker } from '../spells/SpellSlotTracker';
import { SpellList } from '../spells/SpellList';
import { LongRestButton } from './RestButtons';
import { ShortRestDialog } from './ShortRestDialog';
import { Character } from '@/lib/stores/useCharacterStore';
import { InventoryPanel } from './InventoryPanel';
import { exportCharacterToJSON } from '@/lib/utils/export-character';
import { generateShareUrl } from '@/lib/utils/share-character';
import { toast } from "sonner";

interface CharacterSheetProps {
    id: number;
}

export function CharacterSheet({ id }: CharacterSheetProps) {
    const character = useLiveQuery(() => db.characters.get(id), [id]);

    if (character === undefined) return <div>Loading...</div>;
    if (character === null) return <div>Character not found</div>;

    // Type assertion or safe access since database schema 'data' is any.
    // Ideally, use a Zod schema to parse 'data'. For now, manual access.
    const race = character.data?.race || '';
    const background = character.data?.background || '';
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

    const hp = character.data?.hp || {
        current: 10 + calculateModifier(scores.con),
        max: 10 + calculateModifier(scores.con),
        temp: 0
    };

    const hitDice = character.data?.hitDice || {
        current: character.level,
        max: character.level,
        die: "d8" // Default fallback
    };

    const deathSaves = character.data?.deathSaves || { successes: 0, failures: 0 };
    const attacks = character.data?.attacks || [];
    const skillProficiencies = character.data?.skillProficiencies || [];

    // Level 1-4: +2, 5-8: +3 ... simple formula: floor((level-1)/4) + 2
    const proficiencyBonus = Math.floor((character.level - 1) / 4) + 2;

    const handleUpdate = (updates: any) => {
        db.characters.update(id, { data: { ...character.data, ...updates } });
    };

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
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => exportCharacterToJSON(character.data as Character)}
                        title="Export JSON"
                    >
                        <Download className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                            const url = generateShareUrl(character.data as Character);
                            if (url) {
                                navigator.clipboard.writeText(url);
                                toast.success("Share link copied to clipboard!");
                            }
                        }}
                        title="Share via Link"
                    >
                        <Share2 className="h-4 w-4" />
                    </Button>
                    <ShortRestDialog
                        character={character.data as Character}
                        onUpdate={handleUpdate}
                    />
                    <LongRestButton
                        characterData={character.data as Character}
                        onUpdate={handleUpdate}
                    />
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon">
                                <History className="h-4 w-4" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>Roll History</SheetTitle>
                            </SheetHeader>
                            <div className="h-[calc(100vh-8rem)] mt-4">
                                <RollHistoryList />
                            </div>
                        </SheetContent>
                    </Sheet>
                    <Link href="/dashboard">
                        <Button variant="outline">Close</Button>
                    </Link>
                </div>
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

            {/* Main Content Grid */}
            <Tabs defaultValue="main" className="w-full">
                <TabsList className="grid w-full grid-cols-5 mb-6">
                    <TabsTrigger value="main">Main Sheet</TabsTrigger>
                    <TabsTrigger value="skills">Skills</TabsTrigger>
                    <TabsTrigger value="spells">Spells</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory</TabsTrigger>
                    <TabsTrigger value="features">Features</TabsTrigger>
                </TabsList>

                <TabsContent value="main" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Left Column: Vitals */}
                        <div className="md:col-span-1 space-y-6">
                            <VitalityTracker
                                hp={hp}
                                hitDice={hitDice}
                                deathSaves={deathSaves}
                                onUpdate={handleUpdate}
                            />
                            <SavingThrowList
                                abilityScores={scores}
                                proficiencyBonus={proficiencyBonus}
                                proficiencies={character.data?.savingThrowProficiencies || []}
                                onUpdate={(newSaves) => handleUpdate({ savingThrowProficiencies: newSaves })}
                                characterId={id}
                            />
                        </div>

                        {/* Right Column: Combat */}
                        <div className="md:col-span-2 space-y-6">
                            <InitiativeTracker
                                dexScore={scores.dex}
                                initiative={character.data?.initiative}
                                onUpdate={(val) => handleUpdate({ initiative: val })}
                                characterId={id}
                            />
                            <AttackList
                                attacks={attacks}
                                characterId={id}
                                onUpdate={(newAttacks) => handleUpdate({ attacks: newAttacks })}
                            />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="skills">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <SkillList
                            abilityScores={scores}
                            proficiencyBonus={proficiencyBonus}
                            proficiencies={skillProficiencies}
                            onUpdate={(newSkills) => handleUpdate({ skillProficiencies: newSkills })}
                            characterId={id}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="spells">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <SpellSlotTracker
                                slots={character.data?.spellSlots || {}}
                                pactSlots={character.data?.pactSlots}
                                onUpdate={(slots, pact) => handleUpdate({ spellSlots: slots, pactSlots: pact })}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <SpellList
                                spells={character.data?.spells || []}
                                slots={character.data?.spellSlots || {}}
                                onConsumeSlot={(level) => {
                                    const slots = character.data?.spellSlots || {};
                                    const currentSlot = slots[level] || { max: 0, current: 0 };
                                    if (currentSlot.current > 0) {
                                        handleUpdate({
                                            spellSlots: {
                                                ...slots,
                                                [level]: { ...currentSlot, current: currentSlot.current - 1 }
                                            }
                                        });
                                    }
                                }}
                                onUpdate={(newSpells) => handleUpdate({ spells: newSpells })}
                            />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="inventory">
                    <InventoryPanel
                        inventory={character.data?.inventory || []}
                        currency={character.data?.currency || { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 }}
                        strengthScore={scores.str}
                        onUpdate={(newInventory) => handleUpdate({ inventory: newInventory })}
                        onUpdateCurrency={(newCurrency) => {
                            const currentCurrency = character.data?.currency || { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
                            handleUpdate({ currency: { ...currentCurrency, ...newCurrency } });
                        }}
                    />
                </TabsContent>

                <TabsContent value="features">
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
                </TabsContent>
            </Tabs>
        </div>
    );
}
