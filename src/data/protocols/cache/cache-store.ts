export interface CacheStore {
  delete(key: string): Promise<void>;
}
