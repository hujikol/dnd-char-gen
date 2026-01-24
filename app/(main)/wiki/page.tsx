"use client";

import Link from "next/link";
import {
    BookOpen,
    Sword,
    Shield,
    Sparkles,
    Skull,
    Users,
    HeartPulse
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function WikiPage() {
    const categories = [
        {
            title: "Races",
            description: "Playable races from the SRD.",
            icon: Users,
            href: "/wiki/races",
        },
        {
            title: "Classes",
            description: "Character classes and their features.",
            icon: Shield,
            href: "/wiki/classes",
        },
        {
            title: "Spells",
            description: "Magic spells for all casting classes.",
            icon: Sparkles,
            href: "/wiki/spells",
        },
        {
            title: "Equipment",
            description: "Weapons, armor, and adventuring gear.",
            icon: Sword,
            href: "/wiki/equipment",
        },
        {
            title: "Conditions",
            description: "Status effects and conditions.",
            icon: HeartPulse,
            href: "/wiki/conditions",
        },
        {
            title: "Monsters",
            description: "Creatures and adversaries.",
            icon: Skull,
            href: "/wiki/monsters",
            disabled: true,
        },
        {
            title: "Rules",
            description: "Combat, Adventuring, and Magic rules.",
            icon: BookOpen,
            href: "/wiki/rules",
            disabled: true,
        },
    ];

    return (
        <div className="container py-8">
            <div className="flex flex-col space-y-2 mb-8">
                <h1 className="text-3xl font-bold font-cinzel">Rules Reference</h1>
                <p className="text-muted-foreground">
                    Browse the System Reference Document (SRD) 5.1.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                    <Link
                        key={category.title}
                        href={category.disabled ? "#" : category.href}
                        className={category.disabled ? "pointer-events-none opacity-50" : ""}
                    >
                        <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer border-slate-700">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {category.title}
                                </CardTitle>
                                <category.icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <CardDescription>{category.description}</CardDescription>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
