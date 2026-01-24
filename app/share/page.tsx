import { ShareHandler } from "./ShareHandler";
import { Suspense } from "react";

export default function SharePage() {
    return (
        <div className="container mx-auto p-4 min-h-screen flex items-center justify-center">
            <Suspense fallback={<div>Loading share data...</div>}>
                <ShareHandler />
            </Suspense>
        </div>
    );
}
