/**
 * Cryptographic utilities for provably fair dice rolls.
 * Uses the Web Crypto API.
 */

/**
 * Generates a cryptographically strong random hex string of a given byte length.
 * @param lengthBytes Number of bytes of entropy (default 32 for SHA-256 compatibility)
 */
export function generateNonce(lengthBytes: number = 32): string {
    const array = new Uint8Array(lengthBytes);
    crypto.getRandomValues(array);
    return Array.from(array)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Computes the SHA-256 hash of a string.
 * @param message The input string (e.g., the nonce)
 * @returns The hex string of the hash (commitment)
 */
export async function computeCommitment(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Determines the dice result from a hex nonce.
 * We convert the first 4 bytes of the hex string to a 32-bit integer,
 * then take modulo 'sides'.
 * 
 * Note: To be strictly uniform, we should reject values that fall in the 
 * "incomplete" range at the top of the Uint32 space, but for d20/d100 
 * the bias is negligible (approx 1 in 10^9).
 * 
 * @param nonce The secret nonce (hex string)
 * @param sides Number of sides on the die
 */
export function calculateResultFromNonce(nonce: string, sides: number): number {
    // Take first 8 chars (4 bytes) -> 32-bit integer
    const hexSlice = nonce.slice(0, 8); 
    const randomInt = parseInt(hexSlice, 16);
    
    // Result is 1-indexed
    return (randomInt % sides) + 1;
}

/**
 * Verifies a roll by reconstructing the commitment from the nonce 
 * and checking if the result matches the nonce.
 */
export async function verifyRoll(
    nonce: string, 
    commitment: string, 
    expectedSides: number,
    claimedResult: number
): Promise<boolean> {
    const recomputedCommitment = await computeCommitment(nonce);
    if (recomputedCommitment !== commitment) return false;
    
    const recomputedResult = calculateResultFromNonce(nonce, expectedSides);
    return recomputedResult === claimedResult;
}
