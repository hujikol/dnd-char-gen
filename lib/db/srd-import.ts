import { db } from './schema';

export const initializeSRD = async () => {
  try {
    const versionRes = await fetch('/srd/version.json');
    if (!versionRes.ok) throw new Error("Failed to fetch SRD version");
    const versionData = await versionRes.json();

    const currentVersion = await db.versions.get('current');
    if (currentVersion && currentVersion.version === versionData.version) {
      console.log("SRD version match, skipping import.");
      return;
    }

    console.log("SRD Update detected or first run. Importing...");

    const [classes, races, spells, equipment, backgrounds] = await Promise.all([
      fetch('/srd/classes.json').then(r => r.json()),
      fetch('/srd/races.json').then(r => r.json()),
      fetch('/srd/spells.json').then(r => r.json()),
      fetch('/srd/equipment.json').then(r => r.json()),
      fetch('/srd/backgrounds.json').then(r => r.json()),
    ]);

    await db.transaction('rw', [db.classes, db.races, db.spells, db.equipment, db.backgrounds, db.versions], async () => {
      await db.classes.clear();
      await db.races.clear();
      await db.spells.clear();
      await db.equipment.clear();
      await db.backgrounds.clear();

      await db.classes.bulkPut(classes);
      await db.races.bulkPut(races);
      await db.spells.bulkPut(spells);
      await db.equipment.bulkPut(equipment);
      await db.backgrounds.bulkPut(backgrounds);

      await db.versions.put({ id: 'current', version: versionData.version });
    });

    console.log("SRD Import complete.");

  } catch (e) {
    console.error("SRD Import failed", e);
  }
}
