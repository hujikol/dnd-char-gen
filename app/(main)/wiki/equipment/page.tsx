import { EquipmentList } from "@/components/srd/EquipmentList";

export default function EquipmentPage() {
    return (
        <div className="container py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-cinzel mb-2">Equipment</h1>
                <p className="text-muted-foreground">
                    Browse weapons, armor, and adventuring gear from the SRD.
                </p>
            </div>
            <EquipmentList />
        </div>
    );
}
