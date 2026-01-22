"use client";

import { useEffect } from "react";
import { initializeSRD } from "@/lib/db/srd-import";

export function SRDInitializer() {
    useEffect(() => {
        initializeSRD();
    }, []);

    return null;
}
