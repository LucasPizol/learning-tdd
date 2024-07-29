import { DeleteCacheStore, InsertCacheStore } from "@/data/protocols/cache";
import { SavePurchases } from "@/domain/usecases";

export class CacheStoreSpy implements DeleteCacheStore, InsertCacheStore {
  deleteCallsCount = 0;
  insertCallsCount = 0;
  deleteKey: string;
  insertKey: string;
  insertValues: Array<SavePurchases.Params> = [];

  async delete(key: string): Promise<void> {
    this.deleteCallsCount++;
    this.deleteKey = key;
  }

  async insert(key: string, value: any): Promise<void> {
    this.insertCallsCount++;
    this.insertKey = key;
    this.insertValues = value as Array<SavePurchases.Params>;
  }

  async simulateDeleteError(): Promise<void> {
    jest.spyOn(CacheStoreSpy.prototype, "delete").mockImplementationOnce(() => {
      this.deleteCallsCount++;
      throw new Error();
    });
  }

  async simulateInsertError(): Promise<void> {
    jest.spyOn(CacheStoreSpy.prototype, "insert").mockImplementationOnce(() => {
      this.insertCallsCount++;
      throw new Error();
    });
  }
}
