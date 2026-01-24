import { db } from "@/lib/db/schema";
import { toast } from "sonner";
import 'dexie-export-import';

export async function exportFullDatabase() {
  try {
    const blob = await db.export();
    const url = URL.createObjectURL(blob);
    
    const date = new Date().toISOString().split('T')[0];
    const filename = `dnd_full_backup_${date}.json`;

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("Full database export completed.");
  } catch (error) {
    console.error("Export failed:", error);
    toast.error("Failed to export full database.");
  }
}

export async function importFullDatabase(file: File) {
  try {
    await db.import(file, {
      overwriteValues: true,
      clearTables: false // Keep existing data if no conflict? Or clear? 
                        // Full restore usually implies overwriting or clearing. 
                        // Let's safe default: don't clear, just upsert.
    });
    toast.success("Database restored successfully!");
    window.location.reload(); // Reload to reflect changes
  } catch (error) {
    console.error("Import failed:", error);
    toast.error("Failed to restore database.");
  }
}
