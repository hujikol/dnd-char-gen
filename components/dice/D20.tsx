'use client';

import { motion, useAnimation } from 'framer-motion';
import { useEffect, useState } from 'react';

interface D20Props {
    result: number;
    rolling: boolean;
    onLand: () => void;
}

export function D20({ result, rolling, onLand }: D20Props) {
    const controls = useAnimation();
    const [displayNum, setDisplayNum] = useState(result);

    useEffect(() => {
        if (rolling) {
            // Start spinning chaos
            controls.start({
                rotateX: [0, 720, 1080],
                rotateY: [0, 720, 1440],
                rotateZ: [0, 360, 720],
                scale: [0.5, 1.2, 1],
                transition: {
                    duration: 1.5,
                    ease: "easeOut",
                    times: [0, 0.6, 1]
                }
            }).then(() => {
                onLand();
            });

            // Random number flicker
            const interval = setInterval(() => {
                setDisplayNum(Math.floor(Math.random() * 20) + 1);
            }, 50);

            // Stop flicker before landing
            setTimeout(() => {
                clearInterval(interval);
                setDisplayNum(result);
            }, 1200);

            return () => clearInterval(interval);
        } else {
            controls.set({ rotateX: 0, rotateY: 0, rotateZ: 0, scale: 1 });
            setDisplayNum(result);
        }
    }, [rolling, result, controls, onLand]);

    return (
        <motion.div
            animate={controls}
            className="w-32 h-32 relative flex items-center justify-center"
        >
            {/* Simple SVG D20 shape */}
            <svg viewBox="0 0 100 115" className="w-full h-full drop-shadow-2xl">
                <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#fbbf24', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#d97706', stopOpacity: 1 }} />
                    </linearGradient>
                </defs>
                <path
                    fill="url(#grad1)"
                    stroke="#78350f"
                    strokeWidth="2"
                    d="M50 0 L95 25 L95 75 L50 100 L5 75 L5 25 Z"
                />
                {/* Inner lines to fake facets */}
                <path fill="none" stroke="#78350f" strokeWidth="1" d="M50 0 L50 50 L95 75 M50 50 L5 75 M50 50 L50 100" />
                <path fill="rgba(0,0,0,0.1)" d="M50 50 L95 75 L50 100 Z" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-4xl font-bold text-white font-heading ${displayNum === 20 ? 'text-green-200' : (displayNum === 1 ? 'text-red-900' : '')}`}>
                    {displayNum}
                </span>
            </div>
        </motion.div>
    );
}
