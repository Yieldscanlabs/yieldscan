import __buffer_polyfill from 'vite-plugin-node-polyfills/shims/buffer'
globalThis.Buffer = globalThis.Buffer || __buffer_polyfill
import __global_polyfill from 'vite-plugin-node-polyfills/shims/global'
globalThis.global = globalThis.global || __global_polyfill
import __process_polyfill from 'vite-plugin-node-polyfills/shims/process'
globalThis.process = globalThis.process || __process_polyfill

import {
  encodeToCurve,
  hashToCurve,
  schnorr,
  secp256k1
} from "./chunk-NPYUE2QM.js";
import "./chunk-GTYLDB2N.js";
import "./chunk-I22A42VH.js";
export {
  encodeToCurve,
  hashToCurve,
  schnorr,
  secp256k1
};
