
/**
 * Interface representing a mapping of month names for different locales.
 */
export interface MonthNamesMap {
  'en-US': ReadonlyArray<string>;
  'en-UK': ReadonlyArray<string>;
  'pt-BR': ReadonlyArray<string>;
  es: ReadonlyArray<string>;
}

const _monthsDict: MonthNamesMap = Object.freeze({
  'en-US': [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],

  'en-UK': [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],

  'pt-BR': [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ],

  es: [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ],
} satisfies MonthNamesMap);

/**
 * Object containing month names for different locales.
 * @type {MonthNamesMap}
 */
export const monthNames: MonthNamesMap = Object.freeze({ ..._monthsDict });


/**
 * Interface representing a mapping of short month names for different locales.
 */
export interface MonthShortNamesMap {
  'en-US': ReadonlyArray<string>;
  'en-UK': ReadonlyArray<string>;
  'pt-BR': ReadonlyArray<string>;
  es: ReadonlyArray<string>;
}

const _monthsShortDict: MonthShortNamesMap = Object.freeze({
  'en-US': [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec',
  ],

  'en-UK': [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec',
  ],

  'pt-BR': [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
  ],

  es: [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
  ],
} satisfies MonthShortNamesMap);

/**
 * Object containing short month names for different locales.
 * @type {MonthShortNamesMap}
 */
export const monthShortNames: MonthShortNamesMap = Object.freeze({ ..._monthsShortDict });


/**
 * Interface representing a mapping of weekday names for different locales.
 */
export interface WeekdayNamesMap {
  'en-US': ReadonlyArray<string>;
  'en-UK': ReadonlyArray<string>;
  'pt-BR': ReadonlyArray<string>;
  es: ReadonlyArray<string>;
}

const _weekdaysDict: WeekdayNamesMap = Object.freeze({
  'en-US': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  'en-UK': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  'pt-BR': ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
  es: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
} satisfies WeekdayNamesMap);

/**
 * Object containing weekday names for different locales.
 * @type {WeekdayNamesMap}
 */
export const weekdayNames: WeekdayNamesMap = Object.freeze({ ..._weekdaysDict });


/**
 * Interface representing a mapping of short weekday names for different locales.
 */
export interface WeekdayShortNamesMap {
  'en-US': ReadonlyArray<string>;
  'en-UK': ReadonlyArray<string>;
  'pt-BR': ReadonlyArray<string>;
  es: ReadonlyArray<string>;
}

const _weekdaysShortDict: WeekdayShortNamesMap = Object.freeze({
  'en-US': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  'en-UK': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  'pt-BR': ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  es: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
} satisfies WeekdayShortNamesMap);

/**
 * Object containing short weekday names for different locales.
 * @type {WeekdayShortNamesMap}
 */
export const weekdayShortNames: WeekdayShortNamesMap = Object.freeze({ ..._weekdaysShortDict });


/**
 * Interface representing a mapping of abbreviated weekday names for different locales.
 */
export interface WeekdayMinNamesMap {
  'en-US': ReadonlyArray<string>;
  'en-UK': ReadonlyArray<string>;
  'pt-BR': ReadonlyArray<string>;
  es: ReadonlyArray<string>;
}

const _weekdaysMinDict: WeekdayMinNamesMap = Object.freeze({
  'en-US': ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  'en-UK': ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  'pt-BR': ['Do', 'Se', 'Te', 'Qa', 'Qi', 'Se', 'Sa'],
  es: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
} satisfies WeekdayMinNamesMap);


/**
 * Object containing abbreviated weekday names for different locales.
 * @type {WeekdayMinNamesMap}
 */
export const weekdayMinNames: WeekdayMinNamesMap = Object.freeze({ ..._weekdaysMinDict });


/**
 * Interface representing a mapping of the first day of the week for different locales.
 */
export interface WeekdayFirstDayMap {
  'en-US': number;
  'en-UK': number;
  'pt-BR': number;
  es: number;
}

const _weekdaysFirstDayDict: WeekdayFirstDayMap = Object.freeze({
  'en-US': 0,
  'en-UK': 0,
  'pt-BR': 0,
  es: 0,
} satisfies WeekdayFirstDayMap);


/**
 * Object containing frozen first day of the week for different locales.
 * @type {WeekdayFirstDayMap}
 */
export const weekdayFirstDay: WeekdayFirstDayMap = Object.freeze({ ..._weekdaysFirstDayDict });


/**
 * Check if the given year is a leap year.
 * @param {number} year - The year to check.
 * @returns {boolean} True if the year is a leap year, false otherwise.
 */
export function isLeapYear(year: number): boolean {
  return (
    (year % 4 === 0 &&
      year % 100 !== 0 &&
      year % 400 !== 0) ||
      (year % 100 === 0 &&
        year % 400 ===0)
  );
}


/**
 * Get the number of days in February for the given year.
 * @param {number} year - The year to get the days for.
 * @returns {number} The number of days in February.
 */
export function getFebruaryDays(year: number): number {
  if(isLeapYear(year)) return 29;
  return 28;
}


/**
 * Get the number of days in the given month and year.
 * @param {number} month - The month (0-indexed) to get the days for.
 * @param {number} year - The year to get the days for.
 * @returns {number} The number of days in the specified month.
 * @throws {Error} If the month is out of the valid range (0 to 11).
 */
export function getMonthDays(month: number, year: number): number {
  if(month < 0 || month > 11) {
    throw new Error('Invalid month. Month should be between 0 (January) and 11 (December).');
  }

  // Use Date object to get the last day of the month
  const lastDayOfMonth = new Date(year, month + 1, 0);
  return lastDayOfMonth.getDate();
}
