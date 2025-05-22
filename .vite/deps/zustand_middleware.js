import __buffer_polyfill from 'vite-plugin-node-polyfills/shims/buffer'
globalThis.Buffer = globalThis.Buffer || __buffer_polyfill
import __global_polyfill from 'vite-plugin-node-polyfills/shims/global'
globalThis.global = globalThis.global || __global_polyfill
import __process_polyfill from 'vite-plugin-node-polyfills/shims/process'
globalThis.process = globalThis.process || __process_polyfill

import {
  combine,
  createJSONStorage,
  devtools,
  persist,
  redux,
  subscribeWithSelector
} from "./chunk-D4CIU4OB.js";
import "./chunk-I22A42VH.js";
export {
  combine,
  createJSONStorage,
  devtools,
  persist,
  redux,
  subscribeWithSelector
};
