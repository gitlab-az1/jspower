import CryptoJS from 'crypto-js';


export class Hash {

  /**
   * Simple synchronous sha256 hash
   * 
   * @param {string} data The data to hash 
   * @returns {string} The hash
   */
  public static sha256(data: string): string {
    return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
  }

  /**
   * Simple synchronous sha512 hash
   * 
   * @param {string} data The data to hash 
   * @returns {string} The hash
   */
  public static sha512(data: string): string {
    return CryptoJS.SHA512(data).toString(CryptoJS.enc.Hex);
  }
}

export default Hash;