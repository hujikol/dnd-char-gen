"use client";

import * as React from "react";
import {
    Calculator,
    Calendar,
    CreditCard,
    Settings,
    Smile,
    User,
    Plus,
    LayoutDashboard,
    HeartPulse,
    Search,
    Book,
    Backpack,
    Scroll,
    Sun,
    Moon,
    Download
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useTheme } from "next-themes";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/schema";
import { exportCharacterToJSON } from "@/lib/utils/export-character";
import { Character } from "@/lib/stores/useCharacterStore";

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command";

export function GlobalCommand() {
    const [open, setOpen] = React.useState(false);
    const router = useRouter();
    const params = useParams();
    const { setTheme, theme } = useTheme();

    const characterId = params?.id ? parseInt(Array.isArray(params.id) ? params.id[0] : params.id) : undefined;
    const character = useLiveQuery(
        () => (characterId ? db.characters.get(characterId) : undefined),
        [characterId]
    );

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false);
        command();
    }, []);

    return (
        <>
            {/* 
        This is a hidden button or hint text that could be shown 
        if we wanted a visible trigger in the UI, but this story 
        focuses on the keyboard shortcut.
      */}
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="General">
                        <CommandItem
                            onSelect={() => runCommand(() => router.push("/dashboard"))}
                        >
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                        </CommandItem>
                        <CommandItem
                            onSelect={() => runCommand(() => router.push("/character/new"))}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            <span>New Character</span>
                        </CommandItem>
                        {character && (
                            <CommandItem
                                onSelect={() => runCommand(() => exportCharacterToJSON(character.data as Character))}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                <span>Export {character.name} to JSON</span>
                            </CommandItem>
                        )}
                    </CommandGroup>
                    <CommandGroup heading="Quick Access (Future)">
                        <CommandItem disabled>
                            <Scroll className="mr-2 h-4 w-4" />
                            <span>Search Spells</span>
                            <CommandShortcut>Coming Soon</CommandShortcut>
                        </CommandItem>
                        <CommandItem
                            onSelect={() => runCommand(() => router.push("/wiki/equipment"))}
                        >
                            <Backpack className="mr-2 h-4 w-4" />
                            <span>Search Equipment</span>
                        </CommandItem>
                        <CommandItem
                            onSelect={() => runCommand(() => router.push("/wiki/conditions"))}
                        >
                            <HeartPulse className="mr-2 h-4 w-4" />
                            <span>Search Conditions</span>
                        </CommandItem>
                        <CommandItem
                            onSelect={() => runCommand(() => router.push("/wiki"))}
                        >
                            <Book className="mr-2 h-4 w-4" />
                            <span>Rules Reference</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Settings">
                        <CommandItem
                            onSelect={() => runCommand(() => setTheme(theme === "dark" ? "light" : "dark"))}
                        >
                            <Sun className="mr-2 h-4 w-4 dark:hidden" />
                            <Moon className="mr-2 h-4 w-4 hidden dark:inline" />
                            <span>Toggle Theme</span>
                        </CommandItem>
                        <CommandItem
                            onSelect={() => runCommand(() => router.push("/settings/data"))}
                        >
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Data Management</span>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
}
