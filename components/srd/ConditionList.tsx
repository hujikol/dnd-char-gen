"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { getAllConditions } from "@/lib/db/queries";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export function ConditionList() {
    const conditions = useLiveQuery(() => getAllConditions());
    const [search, setSearch] = useState("");

    if (!conditions) return <div className="p-4 text-center">Loading conditions...</div>;

    const filteredConditions = conditions.filter((condition) =>
        condition.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <Input
                placeholder="Search conditions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
            />

            <Accordion type="single" collapsible className="w-full">
                {filteredConditions.map((condition) => (
                    <AccordionItem key={condition.name} value={condition.name}>
                        <AccordionTrigger className="text-left">
                            {condition.name}
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="text-muted-foreground space-y-2">
                                {Array.isArray(condition.data?.desc) ? (
                                    condition.data.desc.map((line: string, index: number) => (
                                        <p key={index}>{line}</p>
                                    ))
                                ) : (
                                    <p>{condition.data?.desc || "No description available."}</p>
                                )}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>

            {filteredConditions.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No conditions found.</p>
            )}
        </div>
    );
}
