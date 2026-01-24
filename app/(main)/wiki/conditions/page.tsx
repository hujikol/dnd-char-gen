import { ConditionList } from "@/components/srd/ConditionList";

export default function ConditionsPage() {
    return (
        <div className="container py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-cinzel mb-2">Conditions</h1>
                <p className="text-muted-foreground">
                    Reference for D&D 5e conditions and their effects.
                </p>
            </div>
            <ConditionList />
        </div>
    );
}
