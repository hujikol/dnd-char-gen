import LZString from "lz-string";
import { Character } from "@/lib/stores/useCharacterStore";
import { CharacterSchema } from "@/lib/validation/character-schema";
import { toast } from "sonner";

export function compressCharacter(character: Character): string | null {
    try {
        const json = JSON.stringify(character);
        // lz-string compresses nicely to URL-safe base64
        return LZString.compressToEncodedURIComponent(json);
    } catch (e) {
        console.error("Compression failed", e);
        return null;
    }
}

export function decompressCharacter(compressed: string): Character | null {
    try {
        const json = LZString.decompressFromEncodedURIComponent(compressed);
        if (!json) return null;
        
        const data = JSON.parse(json);
        // Reuse our Zod schema
        const result = CharacterSchema.safeParse(data);
        
        if (!result.success) {
            console.error("Decompressed data is invalid character", result.error);
            return null;
        }
        
        return result.data as Character;
    } catch (e) {
        console.error("Decompression failed", e);
        return null;
    }
}

export function generateShareUrl(character: Character): string {
    const compressed = compressCharacter(character);
    if (!compressed) {
        toast.error("Failed to generate share link (data may be too complex)");
        return ""; 
    }
    
    // Check approximate URL length warning
    if (compressed.length > 2000) {
        console.warn("Share link is very long (>2000 chars), some browsers may struggle.");
        toast.info("Character data is large. Link might be truncated by some apps.");
    }
    
    // Assuming we are running in browser
    const baseUrl = window.location.origin;
    return `${baseUrl}/share?data=${compressed}`;
}
