import { mockPurchases } from "@/data/tests";
import { CacheStoreSpy } from "@/data/tests/mock-cache";
import { LocalSavePurchases } from "@/data/usecases";

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
