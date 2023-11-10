export * from './_types';
export { default as XHRDriver } from './xhr';



import { RequestDriver, RequestOptions } from './_types';
import { Exception } from '../../errors/exception';
import { ssrSafeWindow } from '../../ssr';
import { isNode } from '../../constants';

import FetchDriver from './fetch';
// import HttpDriver from './http';
import XHRDriver from './xhr';



type DriverDescriptor = {
  readonly constructor: (new (options?: RequestOptions) => RequestDriver);
  readonly env: 'browser' | 'node' | 'both';
}


const knownDrivers: DriverDescriptor[] = [
  {
    constructor: FetchDriver,
    env: 'both',
  },
  {
    constructor: XHRDriver,
    env: 'browser',
  },
  /* {
    constructor: HttpDriver,
    env: 'node',
  }, */
];


export default ((function(): (new (options?: RequestOptions) => RequestDriver) {
  let index = 0;

  if(!isNode && ssrSafeWindow) {
    index = knownDrivers.findIndex(item => item.env === 'browser');

    if(index < 0) {
      index = knownDrivers.findIndex(item => item.env === 'both');
    }
  } else if(isNode) {
    index = knownDrivers.findIndex(item => item.env === 'node');

    if(index < 0) {
      index = knownDrivers.findIndex(item => item.env === 'both');
    }
  }

  if(index < 0) {
    throw new Exception(`No HTTP driver available for ${isNode ? 'Node.js' : 'Browser'} environment`);
  }

  return knownDrivers[index].constructor;
})()) as (new (options?: RequestOptions) => RequestDriver);