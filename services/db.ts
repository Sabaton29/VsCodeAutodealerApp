
import { openDB, DBSchema, IDBPDatabase } from 'idb';

const DB_NAME = 'autodealer-db';
const DB_VERSION = 1;
const STORE_NAME = 'keyval';

interface MyDB extends DBSchema {
  [STORE_NAME]: {
    key: string;
    value: any;
  };
}

let dbPromise: Promise<IDBPDatabase<MyDB>>;

const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<MyDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
};

export async function get<T>(key: string): Promise<T | undefined> {
  const db = await initDB();
  return db.get(STORE_NAME, key);
}

export async function set(key: string, value: any): Promise<IDBValidKey> {
  const db = await initDB();
  return db.put(STORE_NAME, value, key);
}

export async function del(key: string): Promise<void> {
    const db = await initDB();
    return db.delete(STORE_NAME, key);
}

export async function clear(): Promise<void> {
    const db = await initDB();
    return db.clear(STORE_NAME);
}
