'use client';

import { useEffect, useState } from 'react';
import { useCharacterStore } from '@/lib/stores/useCharacterStore';
import { RaceSelection } from '@/components/character/creation/RaceSelection';
import { ClassSelection } from '@/components/character/creation/ClassSelection';
import { BackgroundSelection } from '@/components/character/creation/BackgroundSelection';
import { AbilityScoreSelection } from '@/components/character/creation/AbilityScoreSelection';
import { Separator } from '@/components/ui/separator';
import { db } from '@/lib/db/schema';
import { useRouter } from 'next/navigation';

export default function NewCharacterPage() {
    const { initCharacter, character } = useCharacterStore();
    const [step, setStep] = useState<'race' | 'class' | 'background' | 'abilities'>('race');
    const router = useRouter();

    useEffect(() => {
        // Only init if no character.
        if (!character) {
            initCharacter();
        }
    }, [character, initCharacter]);

    if (!character) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="text-muted-foreground animate-pulse">Initializing Grimoire...</p>
            </div>
        );
    }

    const handleFinish = async () => {
        if (!character) return;

        try {
            const id = await db.characters.add({
                name: character.name,
                class: character.class,
                level: character.level,
                data: {
                    race: character.race,
                    background: character.background,
                    abilityScores: character.abilityScores,
                    abilityScoreMethod: character.abilityScoreMethod,
                    createdAt: new Date().toISOString(),
                }
            });

            // Optional: clear store or re-init?
            // initCharacter(); 

            router.push(`/character/${id}`);
        } catch (error) {
            console.error("Failed to save character:", error);
        }
    };

    // Steps mapping for visuals
    const steps = [
        { id: 'race', label: 'Race' },
        { id: 'class', label: 'Class' },
        { id: 'background', label: 'Background' },
        { id: 'abilities', label: 'Abilities' },
    ];

    return (
        <div className="container mx-auto p-4 md:p-6 max-w-5xl space-y-8 pb-24 md:pb-6">
            <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
                    Create Character
                </h1>

                {/* Progress Navigation */}
                <nav aria-label="Progress">
                    <ol role="list" className="flex items-center space-x-2 md:space-x-8 overflow-x-auto pb-2 scrollbar-none">
                        {steps.map((s, index) => {
                            const isActive = step === s.id;
                            // Simple logic: if step index < current step index, it's completed? 
                            // For now simpler logic: Just highlight active.

                            const styles = isActive
                                ? 'text-primary font-bold border-b-2 border-primary'
                                : 'text-muted-foreground hover:text-foreground';

                            return (
                                <li key={s.id} className={`flex items-center shrink-0 ${styles} pb-1 transition-colors duration-200 cursor-default`}>
                                    <span className="text-sm md:text-base uppercase tracking-wider">{s.label}</span>
                                    {index < steps.length - 1 && (
                                        <span className="ml-2 md:ml-8 text-muted-foreground/30 select-none">&gt;</span>
                                    )}
                                </li>
                            );
                        })}
                    </ol>
                </nav>
                <Separator className="bg-border/50" />
            </div>

            <div className="min-h-[400px]">
                {step === 'race' && <RaceSelection onNext={() => setStep('class')} />}

                {step === 'class' && (
                    <ClassSelection
                        onNext={() => setStep('background')}
                        onBack={() => setStep('race')}
                    />
                )}

                {step === 'background' && (
                    <BackgroundSelection
                        onNext={() => setStep('abilities')}
                        onBack={() => setStep('class')}
                    />
                )}

                {step === 'abilities' && (
                    <AbilityScoreSelection
                        onNext={handleFinish}
                        onBack={() => setStep('background')}
                    />
                )}
            </div>
        </div>
    );
}
