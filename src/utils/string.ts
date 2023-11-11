import { assertString } from './assertions';


/**
 * Shuffle the specified string.
 * 
 * @param str 
 * @returns 
 */
export function strShuffle(str: string): string {
  assertString(str);
  const arr = str.split('');

  // Loop through the array
  for (let i = arr.length - 1; i > 0; i--) {
    // Generate a random index
    const j = Math.floor(Math.random() * (i + 1));

    // Swap the current element with the random element
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }

  // Convert the array back to a string and return it
  return arr.join('');
}


/**
 * Split the specified string into chunks of the specified size.
 * 
 * @param str 
 * @param limit 
 * @param separator 
 * @returns 
 */
export function splitString(str: string, limit: number = 100, separator: string = '\n'): string {
  const chunkSize = limit;
  const chunks: string[] = [];

  for(let i = 0; i < str.length; i += chunkSize) {
    chunks.push(str.slice(i, i + chunkSize));
  }

  return chunks.join(String(separator));
}


/**
 * Join the specified string by removing the specified separator.
 * 
 * @param str 
 * @param separator 
 * @returns 
 */
export function joinString(str: string, separator: string = '\n'): string {
  while(str.includes(separator)) {
    str = str.replace(separator, '');
  }

  return str;
}


/**
 * Reverse the specified string.
 * 
 * @param {string} str 
 * @returns {string}
 */
export function reverseString(str: string): string {
  let reversed = '';
  
  for(let i = str.length - 1; i >= 0; i--) {
    reversed += str[i];
  }

  return reversed;
}


/**
 * Capitalize the first letter of each word in the specified string.
 * 
 * @param {string} str 
 * @returns {string}
 */
export const capitalizeText = (str: string): string => str.split(/\s/).map(item => `${item.charAt(0).toUpperCase()}${item.substring(1)}`).join(' ');