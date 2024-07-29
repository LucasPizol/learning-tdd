export interface DeleteCacheStore {
  delete(key: string): Promise<void>;
}

export interface InsertCacheStore {
  insert(key: string, purchases: any): Promise<void>;
}
