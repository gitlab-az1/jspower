import { Exception } from '../errors';


/**
 * A string representing a time interval.
 */
export type DateTimeString = 
  | `${number}ms`
  | `${number}s`
  | `${number}m`
  | `${number}h`
  | `${number}d`
  | `${number}w`
  | `${number}M`
  | `${number}y`;

/**
 * Parses a string representing a time interval and returns a new Date object.
 *
 * @param {string} timeString - The time interval string, e.g., "1d", "15m", "1w".
 * @param {Date} [baseDate=new Date()] - The base date to calculate the new date from (optional, default is the current date).
 * @returns {Date | null} A new Date object representing the calculated date, or null if parsing fails.
 */
export function parseTimeString(timeString: DateTimeString, baseDate?: Date): Date {
  const regex = /^(\d+)([smhdwMy])$/; // Updated regex to include seconds (s), milliseconds (ms), and months (M)
  const match = timeString.match(regex);

  if(!match) {
    throw new Exception(`Invalid time string format \`${timeString}\``);
  }

  const [, value, unit] = match;
  const now = baseDate && (baseDate instanceof Date) ?
    new Date(baseDate.getTime()) :
    new Date();

  switch (unit) {
    case 's':
      now.setSeconds(now.getSeconds() + parseInt(value, 10));
      break;
    case 'm':
      now.setMinutes(now.getMinutes() + parseInt(value, 10));
      break;
    case 'h':
      now.setHours(now.getHours() + parseInt(value, 10));
      break;
    case 'd':
      now.setDate(now.getDate() + parseInt(value, 10));
      break;
    case 'w':
      now.setDate(now.getDate() + parseInt(value, 10) * 7);
      break;
    case 'M':
      now.setMonth(now.getMonth() + parseInt(value, 10));
      break;
    case 'y':
      now.setFullYear(now.getFullYear() + parseInt(value, 10));
      break;
    case 'ms':
      now.setMilliseconds(now.getMilliseconds() + parseInt(value, 10));
      break;
    default:
      throw new Exception(`Invalid time unit \`${unit}\``);
  }

  return now;
}


/**
 * Parses a relative time string based on the difference between the provided date or timestamp
 * and the current date. The result is formatted using the Internationalization API's
 * RelativeTimeFormat.
 *
 * @param {Date|number} date The Date object or timestamp (in milliseconds) to calculate relative time from.
 * @param {string} [lang= en] The language code to use for formatting the relative time (default: 'en').
 * @returns {string} A string representing the relative time, formatted based on the provided language.
 */
export function parseRelativeTimeString(date: Date | number, lang: string = 'en'): string {
  const timeMs = typeof date === 'number' ? date : date.getTime();
  const deltaSeconds = Math.round((timeMs - Date.now()) / 1000);
  const cutoffs = [60, 3600, 86400, 86400 * 7, 86400 * 30, 86400 * 365, Infinity];
  const units = ['second', 'minute', 'hour', 'day', 'week', 'month', 'year'];
  const unitIndex = cutoffs.findIndex(cutoff => cutoff > Math.abs(deltaSeconds));
  const divisor = unitIndex ? cutoffs[unitIndex - 1] : 1;
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });

  return rtf.format(Math.floor(deltaSeconds / divisor), units[unitIndex] as any);
}


const _default = {
  parseTimeString,
  parseRelativeTimeString,
};

export default Object.freeze(_default);