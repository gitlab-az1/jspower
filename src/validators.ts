import { is } from './utils';


export function validateJSON(value: string): boolean {
  if(!is.isString(value)) return false;

  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

export function validateSerializableObjectToJSON(value: any): boolean {
  try {
    JSON.parse(JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}


export function validateEmail(value: string): boolean {
  if(!is.isString(value)) return false;

  const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(value.toLowerCase());
}