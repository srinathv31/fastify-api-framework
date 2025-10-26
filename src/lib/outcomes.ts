// src/lib/outcomes.ts

const store = new Map<string, any>();

export function outcomes() {
  return {
    async save(id: string, payload: any) {
      store.set(id, payload);
    },
    async get(id: string) {
      return store.get(id);
    },
    async values() {
      // return array of objects with key and value
      return Array.from(store.entries()).map(([key, value]) => ({
        key,
        value,
      }));
    },
  };
}
