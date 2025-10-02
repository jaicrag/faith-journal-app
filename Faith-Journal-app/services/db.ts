import { openDB, type IDBPDatabase } from 'idb';
import { type Entry } from '../types.ts';
import { DB_NAME, DB_VERSION, STORE_NAME } from '../constants.ts';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb() {
    if (!dbPromise) {
        dbPromise = openDB(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, {
                        keyPath: 'id',
                        autoIncrement: true,
                    });
                    store.createIndex('type', 'type', { unique: false });
                    store.createIndex('date', 'date', { unique: false });
                    store.createIndex('personName', 'personName', { unique: false });
                }
            },
        });
    }
    return dbPromise;
}

export const addEntry = async (entry: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>): Promise<Entry> => {
    const db = await getDb();
    const now = Date.now();
    const newEntry = { ...entry, createdAt: now, updatedAt: now } as Omit<Entry, 'id'>;
    // FIX: Cast the returned key to number, as autoIncrement is true.
    const id = await db.add(STORE_NAME, newEntry) as number;
    return { ...newEntry, id };
};

export const getEntries = async (): Promise<Entry[]> => {
    const db = await getDb();
    const entries = await db.getAll(STORE_NAME);
    // Sort by date and time descending by default
    return entries.sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());
};

export const updateEntry = async (entry: Omit<Entry, 'updatedAt'>): Promise<Entry> => {
    const db = await getDb();
    const updatedEntry = { ...entry, updatedAt: Date.now() };
    await db.put(STORE_NAME, updatedEntry);
    return updatedEntry;
};

export const deleteEntry = async (id: number): Promise<void> => {
    const db = await getDb();
    await db.delete(STORE_NAME, id);
};

export const clearAllEntries = async (): Promise<void> => {
    const db = await getDb();
    await db.clear(STORE_NAME);
};
