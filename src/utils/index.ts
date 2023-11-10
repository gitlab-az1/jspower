export { Pair } from './pair';


/**
 * Resolve object with deep prototype chain to a flat object
 * 
 * @param {Object} sourceObj source object
 * @param {Object} [destObj]
 * @param {Function|Boolean} [filter]
 * @param {Function} [propFilter]
 *
 * @returns {Object}
 */
export function toFlatObject(sourceObj: Record<any, any>, destObj: Record<any, any>, filter?: (src: object, dest: object) => boolean | boolean, propFilter?: (prop: string, src: object, dest: object) => boolean): Record<any, any> {
  let props;
  let i;
  let prop;
  const merged: Record<any, any> = {};

  destObj = destObj || {};
  if(sourceObj == null) return destObj;

  do {
    props = Object.getOwnPropertyNames(sourceObj);
    i = props.length;

    while (i-- > 0) {
      prop = props[i];

      if((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
        destObj[prop] = sourceObj[prop];
        merged[prop] = true;
      }
    }

    sourceObj = (filter as unknown as any) !== false && Object.getPrototypeOf(sourceObj);
  } while (sourceObj && (!filter || filter(sourceObj, destObj)) && sourceObj !== Object.prototype);

  return destObj;
}