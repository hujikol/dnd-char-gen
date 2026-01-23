'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/schema';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Copy, History } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { verifyRoll } from '@/lib/dice/crypto';

export function RollHistoryList() {
    const history = useLiveQuery(() => db.rollHistory.orderBy('timestamp').reverse().limit(50).toArray());
    const [verifiedIds, setVerifiedIds] = useState<number[]>([]);

    const handleVerify = async (roll: any) => {
        if (!roll.result.details?.[0]) return;

        // Just verifying the first die for MVP demo
        const detail = roll.result.details[0];
        const isValid = await verifyRoll(detail.nonce, detail.commitment, detail.sides, detail.result);

        if (isValid) {
            setVerifiedIds(prev => [...prev, roll.id]);
        } else {
            alert('Verification Failed! This roll may have been tampered with.');
        }
    };

    if (!history?.length) {
        return <div className="text-center text-muted-foreground p-4">No recent rolls.</div>;
    }

    return (
        <ScrollArea className="h-full pr-4">
            <div className="space-y-4">
                {history.map((entry: any) => (
                    <Card key={entry.id} className="p-3">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <div className="font-bold flex items-center gap-2">
                                    {entry.result.request.label || "Dice Roll"}
                                    {verifiedIds.includes(entry.id as number) && (
                                        <Badge variant="outline" className="text-green-500 border-green-500 gap-1 text-[10px] px-1 h-5">
                                            <Check className="h-3 w-3" /> Verified
                                        </Badge>
                                    )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {format(entry.timestamp, "HH:mm:ss")}
                                </div>
                            </div>
                            <div className="text-xl font-bold font-mono">
                                {entry.result.total}
                            </div>
                        </div>

                        <div className="text-sm bg-secondary/30 p-2 rounded mb-2 font-mono">
                            {entry.result.breakdown}
                        </div>

                        {entry.result.details?.[0] && !verifiedIds.includes(entry.id as number) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-xs h-6"
                                onClick={() => handleVerify(entry)}
                            >
                                Verify Proof
                            </Button>
                        )}

                        {entry.result.details?.[0] && verifiedIds.includes(entry.id as number) && (
                            <div className="text-[10px] text-muted-foreground font-mono truncate">
                                Hash: {entry.result.details[0].commitment.substring(0, 10)}...
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        </ScrollArea>
    );
}
