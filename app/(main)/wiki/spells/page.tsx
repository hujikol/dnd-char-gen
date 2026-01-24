import { SpellList } from "@/components/srd/SpellList";

export default function SpellsPage() {
    return (
        <div className="container py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-cinzel mb-2">Spells</h1>
                <p className="text-muted-foreground">
                    Browse and search the complete list of D&D 5e SRD spells.
                </p>
            </div>
            <SpellList />
        </div>
    );
}
