'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Sword } from 'lucide-react';
import { Character } from '@/lib/stores/useCharacterStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { rollD20 } from '@/lib/dice/engine';
import { useDiceStore } from '@/lib/stores/useDiceStore';

interface AttackListProps {
    attacks: Character['attacks'];
    onUpdate: (attacks: Character['attacks']) => void;
    characterId: number;
}

export function AttackList({ attacks = [], onUpdate, characterId }: AttackListProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [newAttack, setNewAttack] = useState({ name: '', bonus: 0, damage: '', type: '' });
    const { triggerRoll } = useDiceStore();

    const handleAdd = () => {
        const attack = {
            id: crypto.randomUUID(),
            ...newAttack,
            bonus: Number(newAttack.bonus)
        };
        onUpdate([...(attacks || []), attack]);
        setIsOpen(false);
        setNewAttack({ name: '', bonus: 0, damage: '', type: '' });
    };

    const handleRoll = async (attack: any) => {
        const result = await rollD20(characterId, attack.bonus, `Attack: ${attack.name}`);
        triggerRoll(result, 'd20');
    };

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="font-heading text-lg">Attacks</CardTitle>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline"><Plus className="h-4 w-4" /></Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Attack</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input
                                    value={newAttack.name}
                                    onChange={e => setNewAttack({ ...newAttack, name: e.target.value })}
                                    placeholder="Greataxe"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Attack Bonus</Label>
                                <Input
                                    type="number"
                                    value={newAttack.bonus}
                                    onChange={e => setNewAttack({ ...newAttack, bonus: parseInt(e.target.value) || 0 })}
                                    placeholder="5"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Damage</Label>
                                    <Input
                                        value={newAttack.damage}
                                        onChange={e => setNewAttack({ ...newAttack, damage: e.target.value })}
                                        placeholder="1d12 + 3"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Input
                                        value={newAttack.type}
                                        onChange={e => setNewAttack({ ...newAttack, type: e.target.value })}
                                        placeholder="Slashing"
                                    />
                                </div>
                            </div>
                            <Button onClick={handleAdd} className="w-full">Add Attack</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
                {(!attacks || attacks.length === 0) && (
                    <div className="text-sm text-muted-foreground italic text-center py-4">
                        No attacks added.
                    </div>
                )}
                {attacks?.map((attack) => (
                    <div
                        key={attack.id}
                        className="flex items-center justify-between p-2 border rounded-md hover:bg-accent/50 cursor-pointer transition-colors group"
                        onClick={() => handleRoll(attack)}
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded">
                                <Sword className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <div className="font-bold">{attack.name}</div>
                                <div className="text-xs text-muted-foreground">{attack.damage} {attack.type}</div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="text-sm font-bold bg-secondary px-2 py-0.5 rounded text-secondary-foreground">
                                {attack.bonus >= 0 ? `+${attack.bonus}` : attack.bonus}
                            </div>
                            <div className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                Click to Roll
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
