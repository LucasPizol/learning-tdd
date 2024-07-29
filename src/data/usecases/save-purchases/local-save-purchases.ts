import { DeleteCacheStore, InsertCacheStore } from "@/data/protocols/cache";

export class LocalSavePurchases {
  constructor(
    private readonly cacheStore: DeleteCacheStore & InsertCacheStore
  ) {}

  async save(): Promise<void> {
    await this.cacheStore.delete("purchases");
    await this.cacheStore.insert("purchases");
  }
}
