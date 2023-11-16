function _getIndexByKey(key: string, factor: number = 4): number {
  let hash = 0;

  for(let i = 0; i < key.length; i++) {
    hash += key.charCodeAt(i);
  }

  return hash % factor;
}


export const HashTableSymbol = Symbol('$HashTable');
export const getIndexByKey = _getIndexByKey;


export class HashTable<T> {
  static readonly #storageLimit = 4;
  #storage: Array<Array<[string, T]>> = [];

  public console() {
    console.table([ ...this.#storage ]);
  }

  public add(key: string, value: T): void {
    return this.#DoAdd(key, value);
  }

  #DoAdd(key: string, value: T): void {
    const index = _getIndexByKey(key, HashTable.#storageLimit);

    if(!this.#storage[index] || typeof this.#storage[index] === 'undefined' || this.#storage[index] == undefined) {
      this.#storage[index] = [
        [key, value],
      ];
    } else {
      let inserted = false;

      for(let i = 0; i < this.#storage[i].length; i++) {
        if(this.#storage[index][i][0] === key) {
          this.#storage[index][i][1] = value;
          inserted = true;

          break;
        }
      }

      if(!inserted) {
        this.#storage[index].push([key, value]);
      }
    }
  }


  public remove(key: string): void {
    return this.#DoRemove(key);
  }

  #DoRemove(key: string): void {
    const index = _getIndexByKey(key, HashTable.#storageLimit);

    if(this.#storage[index].length === 1 && this.#storage[index][0][0] === key) {
      delete this.#storage[index];
    } else {
      for(let i = 0; i < this.#storage[index].length; i++) {
        if(this.#storage[index][i][0] === key) {
          delete this.#storage[index][i];
          break;
        }
      }
    }
  }


  public lookup(key: string): T | null {
    return this.#DoLookup(key);
  }

  #DoLookup(key: string): T | null {
    const index = _getIndexByKey(key, HashTable.#storageLimit);
    if(!this.#storage[index] || this.#storage[index] == undefined) return null;
    
    let value = undefined;

    for(let i = 0; i < this.#storage[index].length; i++) {
      if(this.#storage[index][i][0] === key) {
        value = this.#storage[index][i][1];
        break;
      }
    }

    return value ?? null;
  }
}


export default HashTable;