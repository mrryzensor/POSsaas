import { openDB } from 'idb';

const DB_NAME = 'pos_offline_db';
const STORE_NAME = 'pending_sales';

export async function initIndexedDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
}

export async function saveOfflineSale(saleData: any) {
  const db = await initIndexedDB();
  await db.add(STORE_NAME, { ...saleData, createdAt: new Date().toISOString() });
}

export async function getPendingOfflineSales() {
  const db = await initIndexedDB();
  return db.getAll(STORE_NAME);
}

export async function clearOfflineSales() {
  const db = await initIndexedDB();
  return db.clear(STORE_NAME);
}
