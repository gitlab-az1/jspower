import { Exception } from './errors';


/**
 * Parses a string representing a time interval and returns a new Date object.
 *
 * @param {string} timeString - The time interval string, e.g., "1d", "15m", "1w".
 * @param {Date} [baseDate=new Date()] - The base date to calculate the new date from (optional, default is the current date).
 * @returns {Date | null} A new Date object representing the calculated date, or null if parsing fails.
 */
export function parseTimeString(timeString: string, baseDate?: Date): Date {
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