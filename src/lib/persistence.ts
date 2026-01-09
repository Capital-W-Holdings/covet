import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), '.data');
const DB_FILE = join(DATA_DIR, 'database.json');

interface DatabaseSnapshot {
  users: Record<string, unknown>;
  stores: Record<string, unknown>;
  products: Record<string, unknown>;
  orders: Record<string, unknown>;
  authentications: Record<string, unknown>;
  storeApplications: Record<string, unknown>;
  storePayouts: Record<string, unknown>;
  reviews: Record<string, unknown>;
  disputes: Record<string, unknown>;
  savedAt: string;
}

/**
 * Ensures the data directory exists
 */
function ensureDataDir(): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Saves the database state to a JSON file
 */
export function saveDatabase(db: {
  users: { all: () => unknown[] };
  stores: { all: () => unknown[] };
  products: { all: () => unknown[] };
  orders: { all: () => unknown[] };
  authentications: { all: () => unknown[] };
  storeApplications: { all: () => unknown[] };
  storePayouts: { all: () => unknown[] };
  reviews: { all: () => unknown[] };
  disputes: { all: () => unknown[] };
}): void {
  try {
    ensureDataDir();

    const snapshot: DatabaseSnapshot = {
      users: arrayToRecord(db.users.all()),
      stores: arrayToRecord(db.stores.all()),
      products: arrayToRecord(db.products.all()),
      orders: arrayToRecord(db.orders.all()),
      authentications: arrayToRecord(db.authentications.all()),
      storeApplications: arrayToRecord(db.storeApplications.all()),
      storePayouts: arrayToRecord(db.storePayouts.all()),
      reviews: arrayToRecord(db.reviews.all()),
      disputes: arrayToRecord(db.disputes.all()),
      savedAt: new Date().toISOString(),
    };

    writeFileSync(DB_FILE, JSON.stringify(snapshot, null, 2));
  } catch (error) {
    console.error('Failed to save database:', error);
  }
}

/**
 * Loads the database state from a JSON file
 */
export function loadDatabase(): DatabaseSnapshot | null {
  try {
    if (!existsSync(DB_FILE)) {
      return null;
    }

    const data = readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data) as DatabaseSnapshot;
  } catch (error) {
    console.error('Failed to load database:', error);
    return null;
  }
}

/**
 * Converts an array of items with id to a record
 */
function arrayToRecord(items: unknown[]): Record<string, unknown> {
  const record: Record<string, unknown> = {};
  for (const item of items) {
    if (item && typeof item === 'object' && 'id' in item) {
      record[(item as { id: string }).id] = item;
    }
  }
  return record;
}

/**
 * Converts a record back to an array
 */
export function recordToArray<T>(record: Record<string, unknown>): T[] {
  return Object.values(record) as T[];
}

/**
 * Checks if persistence file exists
 */
export function hasSavedData(): boolean {
  return existsSync(DB_FILE);
}

/**
 * Clears saved data
 */
export function clearSavedData(): void {
  try {
    if (existsSync(DB_FILE)) {
      writeFileSync(DB_FILE, JSON.stringify({ cleared: true, clearedAt: new Date().toISOString() }));
    }
  } catch (error) {
    console.error('Failed to clear saved data:', error);
  }
}
