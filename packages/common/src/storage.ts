export type StorageLike = {
  getItem(key: string): Promise<string | null> | string | null
  setItem(key: string, value: string): Promise<void> | void
  removeItem?(key: string): Promise<void> | void
}

// Helper that normalizes a storage-like object to one with async get (or set i guess) methods
export function normalizeStorage(storage: StorageLike) {
  return {
    async getItem(key: string) {
      return await Promise.resolve(storage.getItem(key))
    },
    async setItem(key: string, value: string) {
      await Promise.resolve(storage.setItem(key, value as any))
    },
    async removeItem(key: string) {
      if (storage.removeItem) await Promise.resolve(storage.removeItem(key))
    }
  }
}

// In-memory storage for tests or environments without persistent storage
export function createInMemoryStorage() {
  const store: Record<string, string> = {}
  return {
    getItem(key: string) {
      return store.hasOwnProperty(key) ? store[key] : null
    },
    setItem(key: string, value: string) {
      store[key] = value
    },
    removeItem(key: string) {
      delete store[key]
    }
  }
}