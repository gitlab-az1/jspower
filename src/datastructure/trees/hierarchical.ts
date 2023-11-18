import type { Dict } from '../../types';
import { Hash } from '../../crypto';



export const HierarchicalTreeSymbol = Symbol('$HierarchyTree');


export class HierarchicalTreeNode<T> {
  readonly #value: T;
  readonly #hash: string;
  public readonly value: T;
  public readonly hash: string;
  #children: HierarchicalTreeNode<T>[];
  public c: HierarchicalTreeNode<T>[];

  constructor(value: T) {
    this.hash = this.#hash = Hash.sha512(JSON.stringify(value));
    this.value = this.#value = value;
    this.#children = [];
    this.c = [];

    if(typeof value === 'object' && 
      (value as unknown as any).children &&
      Array.isArray((value as unknown as any).children)) {
      // -------------------------------------------------------
      for(let child of (value as unknown as any).children) {
        if(!(child instanceof HierarchicalTreeNode)) {
          child = typeof child === 'string' ? JSON.parse(child) : child;
          child = new HierarchicalTreeNode<T>(child as T);
        }

        this.#children.push(child);
      }

      this.c = [...this.#children];
    }
  }

  public get safeValue(): T {
    return this.#value;
  }

  public get contentHash(): string {
    return this.#hash;
  }

  public addChildren(children: HierarchicalTreeNode<T> | T): void {
    if(!(children instanceof HierarchicalTreeNode)) {
      children = new HierarchicalTreeNode(children);
    }

    this.#children.push(children);
    this.c = [...this.#children];
  }

  public removeChild(children: HierarchicalTreeNode<T> | T) {
    if(!(children instanceof HierarchicalTreeNode)) {
      children = new HierarchicalTreeNode(children);
    }

    const targetIndex = this.#children.findIndex(item => item.contentHash === (children as HierarchicalTreeNode<T>).hash);

    if(targetIndex >= 0) {
      this.#children.splice(targetIndex, 1);
    }

    this.c = [...this.#children];
  }

  public find(value: T): HierarchicalTreeNode<T> | undefined {
    const targetHash = Hash.sha512(JSON.stringify(value));
    return this.#children.find(item => item.contentHash === targetHash);
  }

  public get children() {
    return [...this.#children];
  }

  public get childrenArray() {
    return this.#children;
  }
}


export class HierarchicalTree<T> {
  public static fromJSON<T>(json: string): HierarchicalTree<T> {
    const data = JSON.parse(json);
    const tree = new HierarchicalTree<T>(data.value);
    tree.#root.addChildren(data.children[0]);

    return tree;
  }

  readonly #root: HierarchicalTreeNode<T>;

  constructor(rootValue: T) {
    this.#root = new HierarchicalTreeNode<T>(rootValue);
  }

  public get root() {
    return this.#root;
  }

  public getLastItem(node: HierarchicalTreeNode<T> = this.#root): HierarchicalTreeNode<T> | undefined {
    if(node.children.length === 0) return node;
    
    // Recursively go to the last child
    return this.getLastItem(node.children[node.children.length - 1]);
  }

  public getNodesLength(node: HierarchicalTreeNode<T> = this.#root): number {
    let count = 1; // Counting the current node

    for(const child of node.children) {
      count += this.getNodesLength(child);
    }

    return count;
  }

  public reverseTree(node: HierarchicalTreeNode<T> = this.#root): void {
    node.childrenArray.reverse();

    for(const child of node.childrenArray) {
      this.reverseTree(child);
    }
  }

  public toReversedTree(): HierarchicalTree<T> {
    const tree = new HierarchicalTree<T>(this.#root.value);
    tree.#root.addChildren(this.#root.childrenArray[0]);
    tree.reverseTree();

    return tree;
  }

  public serialize(): Dict<any> {
    return this.#serializeNode(this.#root);
  }

  #serializeNode(node: HierarchicalTreeNode<T>): Dict<any> {
    const serializedNode: Record<string, any> = {
      value: node.value,
      children: [],
    };

    for(const child of node.children) {
      serializedNode.children.push(this.#serializeNode(child));
    }

    return serializedNode;
  }

  public toJSON(): string {
    return JSON.stringify(this.#serializeNode(this.#root));
  }
}

export default HierarchicalTree;