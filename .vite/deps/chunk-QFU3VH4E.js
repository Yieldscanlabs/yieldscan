import __buffer_polyfill from 'vite-plugin-node-polyfills/shims/buffer'
globalThis.Buffer = globalThis.Buffer || __buffer_polyfill
import __global_polyfill from 'vite-plugin-node-polyfills/shims/global'
globalThis.global = globalThis.global || __global_polyfill
import __process_polyfill from 'vite-plugin-node-polyfills/shims/process'
globalThis.process = globalThis.process || __process_polyfill

import {
  require_eventemitter3
} from "./chunk-QIKOWVLY.js";
import {
  __toESM,
  require_dist,
  require_dist2,
  require_dist3
} from "./chunk-I22A42VH.js";

// node_modules/eventemitter3/index.mjs
var import_dist = __toESM(require_dist(), 1);
var import_dist2 = __toESM(require_dist2(), 1);
var import_dist3 = __toESM(require_dist3(), 1);
var import_index = __toESM(require_eventemitter3(), 1);

export {
  import_index
};
//# sourceMappingURL=chunk-QFU3VH4E.js.map
