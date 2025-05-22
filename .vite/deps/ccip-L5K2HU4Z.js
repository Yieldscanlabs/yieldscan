import __buffer_polyfill from 'vite-plugin-node-polyfills/shims/buffer'
globalThis.Buffer = globalThis.Buffer || __buffer_polyfill
import __global_polyfill from 'vite-plugin-node-polyfills/shims/global'
globalThis.global = globalThis.global || __global_polyfill
import __process_polyfill from 'vite-plugin-node-polyfills/shims/process'
globalThis.process = globalThis.process || __process_polyfill

import {
  ccipRequest,
  offchainLookup,
  offchainLookupAbiItem,
  offchainLookupSignature
} from "./chunk-OJZU56EP.js";
import "./chunk-YKXGW6GC.js";
import "./chunk-6M4FKC3Z.js";
import "./chunk-IHL3UIY2.js";
import "./chunk-I22A42VH.js";
export {
  ccipRequest,
  offchainLookup,
  offchainLookupAbiItem,
  offchainLookupSignature
};
