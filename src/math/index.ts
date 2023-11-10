export * from './built-in';
export * from './random';

import _random from './random';
import * as node_builtin from './built-in';


export default Object.freeze({
  ...node_builtin,
  random: _random,
});