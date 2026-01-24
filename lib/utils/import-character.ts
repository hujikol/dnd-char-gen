import { db } from "@/lib/db/schema";
import { toast } from "sonner";
import { CharacterSchema, CharacterInput } from "@/lib/validation/character-schema";
import { ZodError } from "zod";

export async function addCharacterToLibrary(data: any): Promise<number> {
    // Zod Schema Validation
    const validationResult = CharacterSchema.safeParse(data);

    if (!validationResult.success) {
        // Extract meaningful error messages
        const error = validationResult.error as ZodError;
        const errors = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
        throw new Error(`Invalid character data: ${errors}`);
    }

    const validData = validationResult.data;

    // Construct the DB object
    // Dexie 'characters' table: id (autoIncrement), name, class, level, race, data
    const newCharacter = {
        name: validData.name,
        class: validData.class,
        level: validData.level,
        race: validData.race,
        background: validData.background || "Unknown",
        data: validData // Store the full validated object
    };

    // Add to DB
    // @ts-ignore - Dexie types might be inferred differently
    const id = await db.characters.add(newCharacter);
    
    return id as number;
}


export async function importCharacterFromJSON(file: File): Promise<number | undefined> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const json = event.target?.result as string;
                if (!json) {
                    throw new Error("Empty file");
                }

                let data;
                try {
                    data = JSON.parse(json);
                } catch (e) {
                    throw new Error("Invalid JSON format");
                }

                const id = await addCharacterToLibrary(data);

                toast.success(`Character "${data.name}" imported successfully!`);
                resolve(id);

            } catch (error) {
                console.error("Import error:", error);
                const errorMessage = error instanceof Error ? error.message : "Failed to import character.";
                
                // Truncate very long error messages
                const toastMessage = errorMessage.length > 100 ? errorMessage.substring(0, 97) + "..." : errorMessage;
                
                toast.error(toastMessage);
                reject(error);
            }
        };

        reader.onerror = () => {
            toast.error("Failed to read file.");
            reject(new Error("File read error"));
        };

        reader.readAsText(file);
    });
}
