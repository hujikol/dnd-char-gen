"use client";

import { useWikiStore } from "@/lib/stores/useWikiStore";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLiveQuery } from "dexie-react-hooks";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { db } from "@/lib/db/schema";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export function WikiSlideOver() {
    const { isOpen, closeWiki, entityType, entityId } = useWikiStore();
    const isDesktop = useMediaQuery("(min-width: 768px)");

    const spell = useLiveQuery(
        () => (entityType === "spell" && entityId ? db.spells.get({ name: entityId }) : undefined),
        [entityType, entityId]
    );

    const equipment = useLiveQuery(
        () => (entityType === "equipment" && entityId ? db.equipment.get({ name: entityId }) : undefined),
        [entityType, entityId]
    );

    const condition = useLiveQuery(
        () => (entityType === "condition" && entityId ? db.conditions.get({ name: entityId }) : undefined),
        [entityType, entityId]
    );

    const renderContent = () => {
        if (entityType === "spell" && spell) {
            return (
                <div className="space-y-4 pb-6">
                    <div className="flex gap-2 text-muted-foreground text-sm italic">
                        <span>Level {spell.level}</span>
                        <span>•</span>
                        <span>{spell.data?.school?.name || spell.data?.school || "Unknown School"}</span>
                    </div>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 text-sm bg-secondary/20 p-3 rounded-lg border">
                        <div>
                            <span className="font-bold text-muted-foreground block text-xs uppercase">Casting Time</span>
                            {spell.data?.casting_time || "N/A"}
                        </div>
                        <div>
                            <span className="font-bold text-muted-foreground block text-xs uppercase">Range</span>
                            {spell.data?.range || "N/A"}
                        </div>
                        <div>
                            <span className="font-bold text-muted-foreground block text-xs uppercase">Components</span>
                            {Array.isArray(spell.data?.components) ? spell.data.components.join(", ") : spell.data?.components}
                        </div>
                        <div>
                            <span className="font-bold text-muted-foreground block text-xs uppercase">Duration</span>
                            {spell.data?.duration || "N/A"}
                        </div>
                    </div>
                    <Separator />
                    <div className="text-sm leading-relaxed space-y-4">
                        {Array.isArray(spell.data?.desc) ? (
                            spell.data.desc.map((line: string, i: number) => <p key={i}>{line}</p>)
                        ) : (
                            <p>{spell.data?.description || "No description available."}</p>
                        )}
                    </div>
                    {spell.data?.higher_level && (
                        <div className="bg-primary/5 p-3 rounded-lg border border-primary/20 mt-4">
                            <span className="font-bold text-primary block text-sm mb-1">At Higher Levels</span>
                            {Array.isArray(spell.data.higher_level) ? (
                                spell.data.higher_level.map((line: string, i: number) => <p key={i} className="text-sm italic">{line}</p>)
                            ) : (
                                <p className="text-sm italic">{spell.data.higher_levels}</p>
                            )}
                        </div>
                    )}
                    <div className="pt-4 flex flex-wrap gap-2">
                        {spell.classes.map(cls => (
                            <Badge key={cls} variant="secondary" className="text-[10px]">{cls}</Badge>
                        ))}
                    </div>
                </div>
            );
        }

        if (entityType === "equipment" && equipment) {
            return (
                <div className="space-y-4 pb-6">
                    <div className="flex gap-2 text-muted-foreground text-sm italic">
                        <span>{equipment.data?.equipment_category?.name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm bg-secondary/20 p-3 rounded-lg border">
                        <div>
                            <span className="font-bold text-muted-foreground block text-xs uppercase">Cost</span>
                            {equipment.data?.cost ? `${equipment.data.cost.quantity} ${equipment.data.cost.unit}` : "N/A"}
                        </div>
                        <div>
                            <span className="font-bold text-muted-foreground block text-xs uppercase">Weight</span>
                            {equipment.data?.weight ? `${equipment.data.weight} lb.` : "N/A"}
                        </div>
                        {equipment.data?.armor_class && (
                            <div>
                                <span className="font-bold text-muted-foreground block text-xs uppercase">AC</span>
                                {equipment.data.armor_class.base} {equipment.data.armor_class.dex_bonus ? "+ Dex" : ""}
                            </div>
                        )}
                        {equipment.data?.damage && (
                            <div>
                                <span className="font-bold text-muted-foreground block text-xs uppercase">Damage</span>
                                {equipment.data.damage.damage_dice} {equipment.data.damage.damage_type?.name}
                            </div>
                        )}
                    </div>
                    <Separator />
                    <div className="text-sm leading-relaxed space-y-4">
                        {Array.isArray(equipment.data?.desc) ? (
                            equipment.data.desc.map((line: string, i: number) => <p key={i}>{line}</p>)
                        ) : (
                            <p>{equipment.data?.description || "No description available."}</p>
                        )}
                    </div>
                    {/* Properties */}
                    {equipment.data?.properties && Array.isArray(equipment.data.properties) && (
                        <div className="pt-4 flex flex-wrap gap-2">
                            {equipment.data.properties.map((prop: any) => (
                                <Badge key={prop.name} variant="outline" className="text-[10px]">{prop.name}</Badge>
                            ))}
                        </div>
                    )}
                </div>
            )
        }

        if (entityType === "condition" && condition) {
            return (
                <div className="space-y-4 pb-6">
                    <div className="text-sm leading-relaxed space-y-4">
                        {Array.isArray(condition.data?.desc) ? (
                            condition.data.desc.map((line: string, i: number) => <p key={i}>{line}</p>)
                        ) : (
                            <p>{condition.data?.desc || "No description available."}</p>
                        )}
                    </div>
                </div>
            )
        }


        return <div className="p-4 text-center">Loading...</div>;
    };

    if (isDesktop) {
        return (
            <Sheet open={isOpen} onOpenChange={(val) => !val && closeWiki()}>
                <SheetContent className="w-[400px] sm:w-[540px] z-[150]"> {/* High z-index to overlay nicely */}
                    <SheetHeader className="mb-4">
                        <SheetTitle className="text-2xl font-heading text-primary">
                            {entityId || "Wiki"}
                        </SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
                        {renderContent()}
                    </ScrollArea>
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <Drawer open={isOpen} onOpenChange={(val) => !val && closeWiki()}>
            <DrawerContent>
                <div className="mx-auto w-full">
                    <DrawerHeader>
                        <DrawerTitle className="text-2xl font-heading text-primary">
                            {entityId || "Wiki"}
                        </DrawerTitle>
                    </DrawerHeader>
                    <div className="p-4 h-[60vh] overflow-y-auto">
                        {renderContent()}
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
