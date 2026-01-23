'use client';

import { CharacterSheet } from '@/components/character/CharacterSheet';

export default function CharacterInternalPage({ params }: { params: { id: string } }) {
    const id = parseInt(params.id);

    if (isNaN(id)) return <div>Invalid ID</div>;

    return (
        <div className="container mx-auto p-4 md:p-6">
            <CharacterSheet id={id} />
        </div>
    );
}
