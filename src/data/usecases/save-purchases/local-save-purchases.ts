import { CacheStore } from "@/data/protocols/cache";

export class LocalSavePurchases {
  constructor(private readonly cacheStore: CacheStore) {}

  async save(): Promise<void> {
    await this.cacheStore.delete("purchases");
  }
}
