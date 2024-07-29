import { DeleteCacheStore, InsertCacheStore } from "@/data/protocols/cache";
import { LocalSavePurchases } from "@/data/usecases";

class CacheStoreSpy implements DeleteCacheStore, InsertCacheStore {
  deleteCallsCount = 0;
  insertCallsCount = 0;
  deleteKey: string;
  insertKey: string;

  async delete(key: string): Promise<void> {
    this.deleteCallsCount++;
    this.deleteKey = key;
  }

  async insert(key: string): Promise<void> {
    this.insertCallsCount++;
    this.insertKey = key;
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
  test("Should not delete cache on sut.init", () => {
    const { cacheStore } = makeSut();
    new LocalSavePurchases(cacheStore);
    expect(cacheStore.deleteCallsCount).toBe(0);
  });

  test("Should delete old cache on sut.save", async () => {
    const { cacheStore, sut } = makeSut();
    await sut.save();
    expect(cacheStore.deleteCallsCount).toBe(1);
    expect(cacheStore.deleteKey).toBe("purchases");
  });

  test("Should not insert new cache if delete fails", () => {
    const { cacheStore, sut } = makeSut();
    jest.spyOn(cacheStore, "delete").mockImplementationOnce(() => {
      throw new Error();
    });
    const promise = sut.save();
    expect(cacheStore.insertCallsCount).toBe(0);
    expect(promise).rejects.toThrow();
  });

  test("Should insert new cache if delete succeds", async () => {
    const { cacheStore, sut } = makeSut();
    await sut.save();
    expect(cacheStore.insertCallsCount).toBe(1);
    expect(cacheStore.deleteCallsCount).toBe(1);
    expect(cacheStore.insertKey).toBe("purchases");
  });
});
