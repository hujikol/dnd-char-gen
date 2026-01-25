import { db } from "@/lib/db/schema";
import { toast } from "sonner";

export async function exportFullDatabase() {
  try {
    const { exportDB } = await import("dexie-export-import");
    const blob = await exportDB(db);
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
    const { importInto } = await import("dexie-export-import");
    await importInto(db, file, {
      overwriteValues: true,
      clearTablesBeforeImport: false 
    });

    toast.success("Database restored successfully!");
    window.location.reload(); 
  } catch (error) {
    console.error("Import failed:", error);
    toast.error("Failed to restore database.");
  }
}


