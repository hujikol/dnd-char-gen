import { db, RollHistoryDB } from '@/lib/db/schema';
import { generateNonce, computeCommitment, calculateResultFromNonce } from './crypto';

export type DieType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';

export interface RollRequest {
    sides: number;
    count: number;
    modifier?: number;
    label?: string; // e.g. "Attack Roll", "Wisdom Save"
    characterId?: number;
}

export interface RollResult {
    total: number;
    rolls: number[];
    breakdown: string; // e.g. "3 + 5 + 2 (mod)"
    details: SingleRollDetail[];
}

export interface SingleRollDetail {
    sides: number;
    result: number;
    nonce: string;
    commitment: string;
}

/**
 * Performs a cryptographic die roll, persists it to history, and returns the result.
 */
export async function rollDice(request: RollRequest): Promise<RollResult> {
    const rolls: number[] = [];
    const details: SingleRollDetail[] = [];
    
    // Generate each roll
    for (let i = 0; i < request.count; i++) {
        const nonce = generateNonce();
        const commitment = await computeCommitment(nonce); // Commitment created
        const result = calculateResultFromNonce(nonce, request.sides); // Result revealed locally
        
        rolls.push(result);
        details.push({
            sides: request.sides,
            result,
            nonce,
            commitment
        });
    }
    
    // Calculate total
    const sum = rolls.reduce((a, b) => a + b, 0);
    const total = sum + (request.modifier || 0);
    
    // Format breakdown
    const baseBreakdown = rolls.join(' + ');
    const modString = request.modifier ? ` ${request.modifier >= 0 ? '+' : '-'} ${Math.abs(request.modifier)}` : '';
    const breakdown = request.count > 1 || request.modifier 
        ? `${baseBreakdown}${modString} = ${total}`
        : `${total}`;

    // Persist to DB
    const rollEntry: RollHistoryDB = {
        timestamp: Date.now(),
        characterId: request.characterId,
        result: {
            request,
            total,
            rolls,
            details, // Contains the proof (nonce + commitment)
            breakdown
        }
    };
    
    await db.rollHistory.add(rollEntry);

    return {
        total,
        rolls,
        breakdown,
        details
    };
}

/**
 * Helper for common rolls
 */
export async function rollD20(characterId?: number, modifier: number = 0, label: string = "d20 Roll") {
    return rollDice({ sides: 20, count: 1, modifier, label, characterId });
}

export async function rollDamage(diceString: string, characterId?: number, label: string = "Damage") {
    // Basic parser for "2d6+3" format
    // For now, let's keep it simple and just expose the base flexible function
    // Implementing a full dice parser is a nice-to-have for later
    return null; 
}
