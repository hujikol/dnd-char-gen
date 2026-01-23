'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { calculateModifier } from '@/lib/utils/calculate-modifier';
import { useDiceStore } from '@/lib/stores/useDiceStore';
import { rollD20 } from '@/lib/dice/engine';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface SkillListProps {
    abilityScores: Record<string, number>;
    proficiencyBonus: number;
    proficiencies: string[];
    onUpdate: (skills: string[]) => void;
    characterId: number;
}

const SKILL_MAP: Record<string, string> = {
    "Acrobatics": "dex",
    "Animal Handling": "wis",
    "Arcana": "int",
    "Athletics": "str",
    "Deception": "cha",
    "History": "int",
    "Insight": "wis",
    "Intimidation": "cha",
    "Investigation": "int",
    "Medicine": "wis",
    "Nature": "int",
    "Perception": "wis",
    "Performance": "cha",
    "Persuasion": "cha",
    "Religion": "int",
    "Sleight of Hand": "dex",
    "Stealth": "dex",
    "Survival": "wis",
};

export function SkillList({ abilityScores, proficiencyBonus, proficiencies = [], onUpdate, characterId }: SkillListProps) {
    const { triggerRoll } = useDiceStore();

    const toggleProficiency = (skill: string) => {
        if (proficiencies.includes(skill)) {
            onUpdate(proficiencies.filter(s => s !== skill));
        } else {
            onUpdate([...proficiencies, skill]);
        }
    };

    const handleRoll = async (skill: string, modifier: number) => {
        const result = await rollD20(characterId, modifier, `${skill} Check`);
        triggerRoll(result, 'd20');
    };

    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <CardTitle className="font-heading">Skills</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-1 min-w-[300px]">
                {Object.entries(SKILL_MAP).map(([skill, ability]) => {
                    const isProficient = proficiencies.includes(skill);
                    const abilityScore = abilityScores[ability] || 10;
                    const abilityMod = calculateModifier(abilityScore);
                    const totalMod = abilityMod + (isProficient ? proficiencyBonus : 0);

                    return (
                        <div
                            key={skill}
                            className={cn(
                                "flex items-center justify-between p-2 rounded-md hover:bg-accent/50 transition-colors cursor-pointer group",
                                isProficient && "bg-primary/5 border border-primary/20"
                            )}
                            onClick={() => handleRoll(skill, totalMod)}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="p-1"
                                    onClick={(e) => { e.stopPropagation(); toggleProficiency(skill); }}
                                >
                                    <div className={cn(
                                        "h-3 w-3 rounded-full border border-primary/50",
                                        isProficient && "bg-primary border-primary"
                                    )} />
                                </div>
                                <div className="font-medium text-sm">{skill} <span className="text-xs text-muted-foreground uppercase ml-1">({ability})</span></div>
                            </div>
                            <Badge variant={isProficient ? "default" : "secondary"} className="font-mono">
                                {totalMod >= 0 ? `+${totalMod}` : totalMod}
                            </Badge>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
