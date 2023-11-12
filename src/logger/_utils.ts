import {
  ASCI_BLUE,
  ASCI_BRIGHT_BLUE,
  ASCI_RED,
  ASCI_BRIGHT_YELLOW,
  ASCI_BRIGHT_GREEN,
  ASCI_BRIGHT_CYAN,
  ASCI_MAGENTA,
  ASCI_RESET,
} from '../utils/asci';


export function formatMessage(message: any, level: string): string {
  let color: string;
  const parts = [];

  switch(level.toLowerCase()) {
    case 'info':
      color = ASCI_BRIGHT_BLUE;
      break;
    case 'warn':
      color = ASCI_BRIGHT_YELLOW;
      break;
    case 'error':
      color = ASCI_RED;
      break;
    case 'success':
      color = ASCI_BRIGHT_GREEN;
      break;
    case 'debug':
      color = ASCI_BRIGHT_CYAN;
      break;
    case 'trace':
      color = ASCI_MAGENTA;
      break;
    default:
      color = ASCI_BLUE;
      break;
  }

  parts.push(`${ASCI_BLUE}${new Date().toISOString()}${ASCI_RESET}`);
  parts.push(`${color}[${level.toLowerCase()}]${ASCI_RESET}`);
  parts.push(`${ASCI_MAGENTA}(${process.pid})${ASCI_RESET}`);
  
  if(['object', 'array'].includes(typeof message)) {
    message = JSON.stringify(message, null, 2);
  }
  
  parts.push(message);
  return parts.join(' ');
}


export function removeAsciCharacters(message: string): string {
  // eslint-disable-next-line no-control-regex
  return message.replace(/\u001b\[\d+m/g, '');
}