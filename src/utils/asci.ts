export const ASCI_RED = '\x1b[31m';
export const ASCI_BOLD = '\x1b[1m';
export const ASCI_BLUE = '\x1b[34m';
export const ASCI_CYAN = '\x1b[36m';
export const ASCI_RESET = '\x1b[0m';
export const ASCI_GREEN = '\x1b[32m';
export const ASCI_YELLOW = '\x1b[33m';
export const ASCI_MAGENTA = '\x1b[35m';
export const ASCI_BRIGHT_RED = '\x1b[91m';
export const ASCI_BRIGHT_BLUE = '\x1b[94m';
export const ASCI_BRIGHT_CYAN = '\x1b[96m';
export const ASCI_BRIGHT_GREEN = '\x1b[92m';
export const ASCI_BRIGHT_YELLOW = '\x1b[93m';
export const ASCI_UNDERLINE = '\x1b[4m';


type ASCIColors = {
  readonly red: string;
  readonly blue: string;
  readonly cyan: string;
  readonly reset: string;
  readonly green: string;
  readonly yellow: string;
  readonly magenta: string;
  readonly brightRed: string;
  readonly brightBlue: string;
  readonly brightCyan: string;
  readonly brightGreen: string;
  readonly brightYellow: string;
};

export const colors: ASCIColors = Object.freeze({
  red: ASCI_RED,
  blue: ASCI_BLUE,
  cyan: ASCI_CYAN,
  reset: ASCI_RESET,
  green: ASCI_GREEN,
  yellow: ASCI_YELLOW,
  magenta: ASCI_MAGENTA,
  brightRed: ASCI_BRIGHT_RED,
  brightBlue: ASCI_BRIGHT_BLUE,
  brightCyan: ASCI_BRIGHT_CYAN,
  brightGreen: ASCI_BRIGHT_GREEN,
  brightYellow: ASCI_BRIGHT_YELLOW,
});


export const format: {
  readonly colors: ASCIColors;
  readonly underline: string;
  readonly reset: string;
  readonly bold: string;
} = Object.freeze({
  colors,
  bold: ASCI_BOLD,
  reset: ASCI_RESET,
  underline: ASCI_UNDERLINE,
});


export async function spinner<T>(
  title: string,
  callback: () => T,
): Promise<T> {
  let i = 0;
  const spin = () => process.stderr.write(`  ${'⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'[i++ % 10]} ${title}\r`);
  const id = setInterval(spin, 100);
  let result: T;

  try {
    result = await callback();
  } finally {
    clearInterval(id);
    process.stderr.write(' '.repeat(process.stdout.columns - 1) + '\r');
  }

  return result;
}