"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { getAllEquipment } from "@/lib/db/queries";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function EquipmentList() {
    const equipment = useLiveQuery(() => getAllEquipment());
    const [search, setSearch] = useState("");
    const [type, setType] = useState<string>("all");

    if (!equipment) return <div className="p-4 text-center">Loading equipment...</div>;

    // Derive unique types from data for the filter dropdown
    const types = Array.from(new Set(equipment.map(item => item.data?.equipment_category?.name).filter(Boolean))).sort();

    const filteredEquipment = equipment.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
        const itemType = item.data?.equipment_category?.name || "Unknown";
        const matchesType = type === "all" ? true : itemType === type;

        return matchesSearch && matchesType;
    });

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
                <Input
                    placeholder="Search equipment..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="md:w-[300px]"
                />
                <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {types.map((t) => (
                            <SelectItem key={t as string} value={t as string}>
                                {t as string}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-1 gap-2">
                {filteredEquipment.map((item) => {
                    const cost = item.data?.cost ? `${item.data.cost.quantity} ${item.data.cost.unit}` : "N/A";
                    const weight = item.data?.weight ? `${item.data.weight} lb.` : null;

                    // Extract simple stats for weapons/armor if available
                    const ac = item.data?.armor_class ? `AC ${item.data.armor_class.base}` : null;
                    const damage = item.data?.damage ? `${item.data.damage.damage_dice} ${item.data.damage.damage_type?.name}` : null;

                    const stats = [cost, weight, ac, damage].filter(Boolean).join(" • ");

                    return (
                        <Card key={item.name} className="hover:bg-muted/50 cursor-pointer transition-colors">
                            <CardHeader className="py-3 px-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <CardTitle className="text-base font-medium">{item.name}</CardTitle>
                                        <span className="text-sm text-muted-foreground">{stats}</span>
                                    </div>
                                    <Badge variant="outline" className="font-mono text-xs">
                                        {item.data?.equipment_category?.name || "Item"}
                                    </Badge>
                                </div>
                            </CardHeader>
                        </Card>
                    )
                })}
            </div>
            {filteredEquipment.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No equipment found.</p>
            )}
        </div>
    );
}
