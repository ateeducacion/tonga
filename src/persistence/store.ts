// Browser storage. IndexedDB keeps image bytes (content-addressed) and the autosave;
// localStorage only small preferences. Nothing is ever sent anywhere.

const DB_NAME = 'tonga';
const DB_VERSION = 1;
const ASSETS = 'assets';
const AUTOSAVE = 'autosave';

export interface AutosaveRecord {
  project: string;
  savedAt: number;
  thumbnail: string;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function db(): Promise<IDBDatabase> {
  dbPromise ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(ASSETS);
      req.result.createObjectStore(AUTOSAVE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB no disponible'));
  });
  return dbPromise;
}

async function run<T>(store: string, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const tx = (await db()).transaction(store, mode);
  const req = fn(tx.objectStore(store));
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(req.result);
    tx.onerror = () => reject(tx.error ?? new Error('Error de almacenamiento'));
    tx.onabort = () => reject(tx.error ?? new Error('Almacenamiento cancelado'));
  });
}

export async function sha256(bytes: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Stored as bytes + type, not as a Blob: WebKit rejects Blobs in IndexedDB in ephemeral
// (private) sessions, while ArrayBuffers work everywhere.
interface StoredAsset {
  type: string;
  bytes: ArrayBuffer;
}

/** Stores the bytes once and returns their canonical source "asset:<sha256>". */
export async function putAsset(blob: Blob): Promise<string> {
  const bytes = await blob.arrayBuffer();
  const key = `asset:${await sha256(bytes)}`;
  await run(ASSETS, 'readwrite', (s) => s.put({ type: blob.type, bytes } satisfies StoredAsset, key));
  return key;
}

export async function getAsset(key: string): Promise<Blob | undefined> {
  const stored = await run<StoredAsset | undefined>(ASSETS, 'readonly', (s) => s.get(key));
  return stored && new Blob([stored.bytes], { type: stored.type });
}

export async function saveAutosave(record: AutosaveRecord): Promise<void> {
  await run(AUTOSAVE, 'readwrite', (s) => s.put(record, 'current'));
}

export async function loadAutosave(): Promise<AutosaveRecord | undefined> {
  return run<AutosaveRecord | undefined>(AUTOSAVE, 'readonly', (s) => s.get('current'));
}

export async function clearAutosave(): Promise<void> {
  await run(AUTOSAVE, 'readwrite', (s) => s.delete('current'));
}

export function getPref(key: string): string | null {
  try {
    return localStorage.getItem(`tonga:${key}`);
  } catch {
    return null;
  }
}

export function setPref(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(`tonga:${key}`);
    else localStorage.setItem(`tonga:${key}`, value);
  } catch {
    /* storage blocked: preference is not kept */
  }
}
