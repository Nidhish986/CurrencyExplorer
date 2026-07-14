const prefix = "gmc:";

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${prefix}${key}`);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T) {
  localStorage.setItem(`${prefix}${key}`, JSON.stringify(value));
}

export function removeStorage(key: string) {
  localStorage.removeItem(`${prefix}${key}`);
}

export interface CachedRecord<T> {
  value: T;
  cachedAt: string;
  expiresAt?: string;
}

export function readCache<T>(key: string): CachedRecord<T> | null {
  return readStorage<CachedRecord<T> | null>(key, null);
}

export function writeCache<T>(key: string, value: T, ttlMs?: number) {
  const now = new Date();
  writeStorage<CachedRecord<T>>(key, {
    value,
    cachedAt: now.toISOString(),
    expiresAt: ttlMs ? new Date(now.getTime() + ttlMs).toISOString() : undefined
  });
}

export function isFresh<T>(record: CachedRecord<T> | null) {
  if (!record?.expiresAt) return Boolean(record);
  return new Date(record.expiresAt).getTime() > Date.now();
}
