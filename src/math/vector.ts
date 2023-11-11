import math from './';
import { Exception } from '../errors/exception';


export type VectorConversionMethods = 
  | 'perspective_projection'
  | 'orthographic_projection';


export class Vector {
  #x: number;
  #y: number;
  #z: number;
  #freezed: boolean;

  /**
     * Create a new vector.
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     */
  constructor(x: number, y: number, z: number) {
    [this.#x, this.#y, this.#z] = [x, y, z];
    this.#freezed = false;
  }

  /**
     * Axis X.
     */
  public get x(): number {
    return this.#x;
  }

  /**
     * Axis Y.
     */
  public get y(): number {
    return this.#y;
  }

  /**
     * Axis Z.
     */
  public get z(): number {
    return this.#z;
  }

  /**
     * Return true if the vector is freezed.
     */
  public get isFreezed(): boolean {
    return this.#freezed;
  }

  /**
     * Return the magnitude of the vector.
     * 
     * @returns 
     */
  public magnitude(): number {
    if (this.#freezed) {
      throw new Exception('Cannot get magnitude of a freezed vector');
    }

    return math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  /**
     * Return the normalized vector.
     * 
     * @returns 
     */
  public normalize(): Vector {
    if (this.#freezed) {
      throw new Exception('Cannot normalize a freezed vector');
    }

    const mag = this.magnitude();

    if(mag === 0) {
      throw new Exception('Cannot normalize a zero vector', {
        reason: 'division by zero',
      });
    }

    return new Vector(this.x / mag, this.y / mag, this.z / mag);
  }

  /**
     * Add a vector to the current one.
     * 
     * @param vec 
     * @returns 
     */
  public add(vec: Vector): Vector {
    if (this.#freezed) {
      throw new Exception('Cannot add a freezed vector');
    }

    return new Vector(this.x + vec.x, this.y + vec.y, this.z + vec.z);
  }

  /**
     * Subtract a vector from the current one.
     * 
     * @param vec 
     * @returns 
     */
  public subtract(vec: Vector): Vector {
    if (this.#freezed) {
      throw new Exception('Cannot subtract a freezed vector');
    }

    return new Vector(this.x - vec.x, this.y - vec.y, this.z - vec.z);
  }

  /**
     * Return the dot product of the current vector and the provided one.
     * 
     * @param vec 
     * @returns 
     */
  public dot(vec: Vector): number {
    if (this.#freezed) {
      throw new Exception('Cannot dot a freezed vector');
    }

    return this.x * vec.x + this.y * vec.y + this.z * vec.z;
  }

  /**
     * Return the cross product of the current vector and the provided one.
     * 
     * @param vec 
     * @returns 
     */
  public cross(vec: Vector): Vector {
    if (this.#freezed) {
      throw new Exception('Cannot cross a freezed vector');
    }

    return new Vector(this.y * vec.z - this.z * vec.y, this.z * vec.x - this.x * vec.z, this.x * vec.y - this.y * vec.x);
  }

  /**
     * Scale the current vector by the provided scalar.
     * 
     * @param scalar 
     * @returns 
     */
  public scale(scalar: number): Vector {
    if (this.#freezed) {
      throw new Exception('Cannot scale a freezed vector');
    }

    return new Vector(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  /**
   * Freeze the current vector to prevent modifications.
   */
  public freeze(): void {
    this.#freezed = true;
  }
}


export class Vector2D {
  #x: number;
  #y: number;
  #freezed: boolean;

  /**
   * Create a new 2D vector.
   * 
   * @param x 
   * @param y 
   */
  constructor(x: number, y: number) {
    this.#x = x;
    this.#y = y;
    this.#freezed = false;
  }

  /**
   * Axis X.
   */
  public get x(): number {
    return this.#x;
  }

  /**
   * Axis Y.
   */
  public get y(): number {
    return this.#y;
  }

  /**
   * Return true if the vector is freezed.
   */
  public get isFreezed(): boolean {
    return this.#freezed;
  }

  /**
   * Return the magnitude of the vector.
   * 
   * @returns 
   */
  public magnitude(): number {
    if (this.#freezed) {
      throw new Exception('Cannot get magnitude of a freezed vector');
    }

    return math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * Return the normalized vector.
   * 
   * @returns 
   */
  public normalize(): Vector2D {
    if (this.#freezed) {
      throw new Exception('Cannot normalize a freezed vector');
    }

    const mag = this.magnitude();
    return new Vector2D(this.x / mag, this.y / mag);
  }

  /**
   * Add a vector to the current one.
   * 
   * @param vec 
   * @returns 
   */
  public add(vec: Vector2D): Vector2D {
    if (this.#freezed) {
      throw new Exception('Cannot add a freezed vector');
    }

    return new Vector2D(this.x + vec.x, this.y + vec.y);
  }

  /**
   * Subtract a vector from the current one.
   * 
   * @param vec 
   * @returns 
   */
  public subtract(vec: Vector2D): Vector2D {
    if (this.#freezed) {
      throw new Exception('Cannot subtract a freezed vector');
    }

    return new Vector2D(this.x - vec.x, this.y - vec.y);
  }

  /**
   * Return the dot product of the current vector and the provided one.
   * 
   * @param vec 
   * @returns 
   */
  public dot(vec: Vector2D): number {
    if (this.#freezed) {
      throw new Exception('Cannot dot a freezed vector');
    }

    return this.x * vec.x + this.y * vec.y;
  }

  /**
   * Scale the current vector by the provided scalar.
   * 
   * @param scalar 
   * @returns 
   */
  public scale(scalar: number): Vector2D {
    if (this.#freezed) {
      throw new Exception('Cannot scale a freezed vector');
    }

    return new Vector2D(this.x * scalar, this.y * scalar);
  }

  /**
   * Freeze the current vector to prevent modifications.
   */
  public freeze(): void {
    this.#freezed = true;
  }
}