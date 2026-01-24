"use client";

import { useWikiStore, WikiEntity } from "@/lib/stores/useWikiStore";
import { cn } from "@/lib/utils";

interface WikiLinkProps extends React.HTMLAttributes<HTMLSpanElement> {
    entity: string;
    type: WikiEntity;
    children: React.ReactNode;
}

export function WikiLink({ entity, type, children, className, ...props }: WikiLinkProps) {
    const { openWiki } = useWikiStore();

    return (
        <span
            className={cn(
                "cursor-pointer text-primary underline decoration-dotted decoration-primary/50 underline-offset-4 hover:decoration-solid hover:text-primary transition-all",
                className
            )}
            onClick={(e) => {
                e.stopPropagation();
                openWiki(type, entity);
            }}
            {...props}
        >
            {children}
        </span>
    );
}
