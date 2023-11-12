import path from 'node:path';
import fs from 'node:fs';

import type { Dict } from './types';
import { root } from './constants';

const allowedDotenvFiles = [
  '.env',
  '.env.local',
  '.env.development',
  '.env.development.local',
  '.env.production',
  '.env.production.local',
];

function readDotenvFile(): string[] {
  let pathname: string = '';

  for(const filename of allowedDotenvFiles) {
    pathname = path.join(root, filename);

    if(fs.existsSync(pathname)) {
      break;
    }
  }

  if(!fs.existsSync(pathname)) return [];
  const contents = fs.readFileSync(pathname, { encoding: 'utf-8' });

  return contents.split('\n').filter(item => item.trim().length > 1).map(item => item.trim());
}


export type EnvOptions = {
  transformValues?: Dict<'boolean' | 'number' | 'json'>;
}

export function load(options?: EnvOptions) {
  const dotenv = readDotenvFile();
    
  for(const item of dotenv) {
    // eslint-disable-next-line prefer-const
    let [key, value] = item.split('=').map(item => item.trim());
    
    if(
      (value.startsWith('"') && value.endsWith('"')) || 
      (value.startsWith('\'') && value.endsWith('\''))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }

  if(options?.transformValues) {
    for(const prop in options.transformValues) {
      if(!process.env[prop]) continue;

      switch(options.transformValues[prop]) {
        case 'boolean':
          (process.env as Dict<any>)[prop] = (process.env[prop] === 'true');
          break;
        case 'number':
          (process.env as Dict<any>)[prop] = Number(String(process.env[prop]));
          break;
        case 'json':
          try {
            const parsed = JSON.parse(String(process.env[prop]));
            process.env[prop] = parsed;
          } catch {
            // not throw
          }
          break;
      }
    }
  }
}


export default Object.freeze({ load });