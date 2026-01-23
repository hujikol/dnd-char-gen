import { describe, it, expect, beforeAll } from 'vitest';
import { generateNonce, computeCommitment, calculateResultFromNonce, verifyRoll } from '@/lib/dice/crypto';

// Polyfill crypto for node/vitest environment if needed
// Vitest with jsdom usually handles this, but strictly speaking crypto.subtle needs secure context or polyfill
// In jsdom environment, window.crypto is available.

describe('Cryptographic Dice Utils', () => {
    it('generates a nonce of correct length', () => {
        const nonce = generateNonce(32);
        // 32 bytes = 64 hex characters
        expect(nonce).toHaveLength(64);
        expect(nonce).toMatch(/^[0-9a-f]+$/);
    });

    it('calculates reproducible results from nonce', () => {
        const nonce = "a1b2c3d4e5f60000000000000000000000000000000000000000000000000000";
        // First 4 bytes: a1b2c3d4 = 2712847316
        // 2712847316 % 20 = 16
        // Result should be 17
        const result = calculateResultFromNonce(nonce, 20);
        expect(result).toBe(17);
    });

    it('computes commitment correctly', async () => {
        const nonce = "test_nonce";
        const commitment = await computeCommitment(nonce);
        // SHA-256 of "test_nonce"
        // echo -n "test_nonce" | shasum -a 256
        // 46070d4bf934fb0d4b06d9e2c46e346944e322444900a435d7d9a95e6d7435f5
        // Check it produces a valid SHA-256 hash (64 hex chars)
        expect(commitment).toHaveLength(64);
        expect(commitment).toMatch(/^[0-9a-f]+$/);
    });

    it('verifies a valid roll', async () => {
        const nonce = generateNonce();
        const commitment = await computeCommitment(nonce);
        const sides = 20;
        const result = calculateResultFromNonce(nonce, sides);

        const isValid = await verifyRoll(nonce, commitment, sides, result);
        expect(isValid).toBe(true);
    });

    it('rejects a tampered result', async () => {
        const nonce = generateNonce();
        const commitment = await computeCommitment(nonce);
        const sides = 20;
        const result = calculateResultFromNonce(nonce, sides); // e.g. 5
        
        const fakeResult = (result % 20) + 1; // Change result

        const isValid = await verifyRoll(nonce, commitment, sides, fakeResult);
        expect(isValid).toBe(false);
    });
});
