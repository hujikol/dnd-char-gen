'use client';

import { useDiceStore } from '@/lib/stores/useDiceStore';
import { AnimatePresence, motion } from 'framer-motion';
import { D20 } from './D20';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

export function DiceBox() {
    const { isRolling, result, rollType, clearRoll } = useDiceStore();
    const [showResult, setShowResult] = useState(false);

    useEffect(() => {
        if (isRolling) setShowResult(false);
    }, [isRolling]);

    // Handle "landed" state
    const handleLand = () => {
        setShowResult(true);
    };

    return (
        <AnimatePresence>
            {isRolling && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    onClick={clearRoll}
                >
                    <div className="relative flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
                        <div className="mb-8 scale-150">
                            {/* Only D20 implemented for demo, fallback to D20 visual for others for now */}
                            <D20
                                result={result?.total || 0}
                                rolling={!showResult}
                                onLand={handleLand}
                            />
                        </div>

                        {showResult && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-card border p-6 rounded-xl shadow-2xl flex flex-col items-center gap-4 min-w-[300px]"
                            >
                                <div className="text-center">
                                    <div className="text-muted-foreground text-sm uppercase font-bold tracking-wider">Result</div>
                                    <div className="text-6xl font-heading font-bold gradient-text">{result?.total}</div>
                                </div>

                                <div className="w-full space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Rolls:</span>
                                        <span className="font-mono">[{result?.rolls.join(', ')}]</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Calculation:</span>
                                        <span className="font-mono">{result?.breakdown}</span>
                                    </div>
                                    {result?.details && result.details[0] && (
                                        <div className="text-[10px] text-muted-foreground font-mono mt-4 border-t pt-2 break-all text-center">
                                            <div className="mb-1">Cryptographic Proof</div>
                                            Hash: {result.details[0].commitment.substring(0, 16)}...
                                        </div>
                                    )}
                                </div>

                                <Button onClick={clearRoll} className="w-full mt-2">
                                    Close
                                </Button>
                            </motion.div>
                        )}

                        {/* Close button for safety */}
                        <button
                            onClick={clearRoll}
                            className="absolute -top-12 right-0 p-2 text-white/50 hover:text-white"
                        >
                            <X className="h-8 w-8" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
