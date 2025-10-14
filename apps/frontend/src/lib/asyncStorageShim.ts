type StorageValue = string;

const memoryStore = new Map<string, StorageValue>();

const AsyncStorage = {
  async getItem(key: string) {
    return memoryStore.has(key) ? memoryStore.get(key)! : null;
  },
  async setItem(key: string, value: StorageValue) {
    memoryStore.set(key, value);
  },
  async removeItem(key: string) {
    memoryStore.delete(key);
  },
  async clear() {
    memoryStore.clear();
  },
  async getAllKeys() {
    return Array.from(memoryStore.keys());
  },
  async multiGet(keys: string[]) {
    return keys.map((key) => [key, memoryStore.get(key) ?? null] as const);
  },
  async multiRemove(keys: string[]) {
    keys.forEach((key) => memoryStore.delete(key));
  },
  async multiSet(entries: Array<[string, StorageValue]>) {
    entries.forEach(([key, value]) => memoryStore.set(key, value));
  },
};

export default AsyncStorage;
export { AsyncStorage };
