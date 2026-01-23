'use client';

import { useCharacterStore } from '@/lib/stores/useCharacterStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PointBuyCalculator } from './abilities/PointBuyCalculator';
import { StandardArrayAssignment } from './abilities/StandardArrayAssignment';
import { Button } from '@/components/ui/button';

interface AbilityScoreSelectionProps {
    onNext: () => void;
    onBack: () => void;
}

export function AbilityScoreSelection({ onNext, onBack }: AbilityScoreSelectionProps) {
    const { character } = useCharacterStore();

    if (!character) return null;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-heading font-bold text-foreground">Determine Ability Scores</h2>
            </div>

            <Tabs defaultValue="point-buy" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="point-buy">Point Buy</TabsTrigger>
                    <TabsTrigger value="standard-array">Standard Array</TabsTrigger>
                </TabsList>
                <TabsContent value="point-buy">
                    <PointBuyCalculator />
                </TabsContent>
                <TabsContent value="standard-array">
                    <StandardArrayAssignment />
                </TabsContent>
            </Tabs>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t border-border flex justify-between container mx-auto md:relative md:bg-transparent md:border-none md:p-0 mt-8">
                <Button variant="outline" onClick={onBack} size="lg" className="w-[45%] md:w-auto hidden md:inline-flex">
                    Back
                </Button>
                <Button variant="outline" onClick={onBack} size="lg" className="w-[45%] md:w-auto md:hidden">
                    Back
                </Button>

                <Button
                    onClick={onNext}
                    size="lg"
                    className="w-[45%] md:w-auto font-heading font-bold"
                >
                    Finish Character
                </Button>
            </div>
        </div>
    );
}
