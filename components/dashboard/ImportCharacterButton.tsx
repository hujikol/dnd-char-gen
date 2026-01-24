"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { importCharacterFromJSON } from "@/lib/utils/import-character";
import { useRouter } from "next/navigation";

export function ImportCharacterButton() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const newId = await importCharacterFromJSON(file);
            if (newId) {
                router.push(`/character/${newId}`);
            }
        } catch (error) {
            // Error handled in utility
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = ""; // Reset
            }
        }
    };

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
            />
            <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
            >
                <Upload className="h-4 w-4" />
                Import
            </Button>
        </>
    );
}
