import { Character } from "@/lib/stores/useCharacterStore";
import { db } from "@/lib/db/schema";
import { toast } from "sonner";

export function exportCharacterToJSON(character: Character) {
    if (!character) return;

    const dataStr = JSON.stringify(character, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const date = new Date().toISOString().split('T')[0];
    const sanitizedName = character.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `${sanitizedName}_${date}.json`;

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export async function bulkExportCharacters() {
    try {
        const characters = await db.characters.toArray();
        if (!characters || characters.length === 0) {
            toast.error("No characters to backup.");
            return;
        }

        // Export as an array of the 'Character' data objects primarily, 
        // but maybe we want to keep the metadata? 
        // Let's export the full DB record structure to make restoring easier (including race/class/level fields outside 'data' if needed for queries)
        // Actually, our import expects just the 'Character' interface (which corresponds to 'data' + some top level fields duplicate).
        // Let's export the raw DB records for a full backup.
        const backupData = {
             version: 1,
             timestamp: new Date().toISOString(),
             type: "dnd-char-gen-backup",
             characters: characters
        };

        const dataStr = JSON.stringify(backupData, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const date = new Date().toISOString().split('T')[0];
        const filename = `dnd_backup_${date}.json`;

        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success(`Exported ${characters.length} characters successfully.`);
    } catch (error) {
        console.error("Bulk export failed:", error);
        toast.error("Failed to back up characters.");
    }
}
