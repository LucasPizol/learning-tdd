import { DeleteCacheStore, InsertCacheStore } from "@/data/protocols/cache";
import { mockPurchases } from "@/data/tests";
import { LocalSavePurchases } from "@/data/usecases";
import { SavePurchases } from "@/domain/usecases";

class CacheStoreSpy implements DeleteCacheStore, InsertCacheStore {
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

type SutTypes = {
  sut: LocalSavePurchases;
  cacheStore: CacheStoreSpy;
};

const makeSut = (): SutTypes => {
  const cacheStore = new CacheStoreSpy();
  const sut = new LocalSavePurchases(cacheStore);
  return {
    sut,
    cacheStore,
  };
};

describe("LocalSavePurchases", () => {
  const purchases = mockPurchases();

  test("Should not delete cache on sut.init", () => {
    const { cacheStore } = makeSut();
    new LocalSavePurchases(cacheStore);
    expect(cacheStore.deleteCallsCount).toBe(0);
  });

  test("Should delete old cache on sut.save", async () => {
    const { cacheStore, sut } = makeSut();
    await sut.save(purchases);
    expect(cacheStore.deleteCallsCount).toBe(1);
    expect(cacheStore.deleteKey).toBe("purchases");
  });

  test("Should not insert new cache if delete fails", () => {
    const { cacheStore, sut } = makeSut();
    cacheStore.simulateDeleteError();

    const promise = sut.save(purchases);
    expect(cacheStore.insertCallsCount).toBe(0);
    expect(promise).rejects.toThrow();
  });

  test("Should insert new cache if delete succeds", async () => {
    const { cacheStore, sut } = makeSut();
    await sut.save(purchases);
    expect(cacheStore.insertCallsCount).toBe(1);
    expect(cacheStore.deleteCallsCount).toBe(1);
    expect(cacheStore.insertKey).toBe("purchases");
    expect(cacheStore.insertValues).toEqual(purchases);
  });

  test("Should throw cache if insert fails", async () => {
    const { cacheStore, sut } = makeSut();
    await cacheStore.simulateInsertError();
    const promise = sut.save(purchases);
    expect(cacheStore.insertCallsCount).toBe(0);
    expect(cacheStore.deleteCallsCount).toBe(1);
    expect(promise).rejects.toThrow();
  });
});
