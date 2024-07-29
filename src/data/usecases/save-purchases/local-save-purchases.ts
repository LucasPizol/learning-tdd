import { DeleteCacheStore, InsertCacheStore } from "@/data/protocols/cache";
import { SavePurchases } from "@/domain";

export class LocalSavePurchases implements SavePurchases {
  constructor(
    private readonly cacheStore: DeleteCacheStore & InsertCacheStore
  ) {}

  async save(purchases: Array<SavePurchases.Params>): Promise<void> {
    await this.cacheStore.delete("purchases");
    await this.cacheStore.insert("purchases", purchases);
  }
}
