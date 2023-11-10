export class Map<T, U = unknown> {
  constructor(i?: IterableIterator<[T, U]> | Iterable<[T, U]>) {
    i;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  public set<K = T extends {} ? keyof T : T, V  = T extends {} ? keyof T : U>(key: K, value: V): void {
    key;value;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  public get<K = T extends {} ? keyof T : T, V  = T extends {} ? keyof T : U>(key: K): V | null {
    key;
    return null;
  }
}

export default Map;