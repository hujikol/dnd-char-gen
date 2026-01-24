"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { exportFullDatabase, importFullDatabase } from "@/lib/utils/db-backup";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function DataSettingsPage() {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await importFullDatabase(file);
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="container mx-auto p-4 md:p-6 max-w-2xl">
            <h1 className="text-3xl font-heading font-bold mb-6">Data Management</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Full Backup</CardTitle>
                    <CardDescription>
                        Export or restore your entire application data, including all characters, custom content, and history.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button onClick={exportFullDatabase} className="w-full sm:w-auto gap-2">
                            <Download className="h-4 w-4" />
                            Export Full Database
                        </Button>

                        <div className="w-full sm:w-auto">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImport}
                                accept=".json"
                                className="hidden"
                            />
                            <Button
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full gap-2"
                            >
                                <Upload className="h-4 w-4" />
                                Restore Database
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Separator className="my-8" />

            <Card className="border-destructive/30">
                <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>
                        Irreversible actions for your data.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="destructive" disabled>
                        Clear All Data (Coming Soon)
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
