import __buffer_polyfill from 'vite-plugin-node-polyfills/shims/buffer'
globalThis.Buffer = globalThis.Buffer || __buffer_polyfill
import __global_polyfill from 'vite-plugin-node-polyfills/shims/global'
globalThis.global = globalThis.global || __global_polyfill
import __process_polyfill from 'vite-plugin-node-polyfills/shims/process'
globalThis.process = globalThis.process || __process_polyfill

import {
  Axios,
  AxiosError,
  AxiosHeaders,
  Cancel,
  CancelToken,
  CanceledError,
  HttpStatusCode,
  VERSION,
  all,
  axios_default,
  formToJSON,
  getAdapter,
  isAxiosError,
  isCancel,
  mergeConfig,
  spread,
  toFormData
} from "./chunk-UMMEOQIZ.js";
import "./chunk-I22A42VH.js";
export {
  Axios,
  AxiosError,
  AxiosHeaders,
  Cancel,
  CancelToken,
  CanceledError,
  HttpStatusCode,
  VERSION,
  all,
  axios_default as default,
  formToJSON,
  getAdapter,
  isAxiosError,
  isCancel,
  mergeConfig,
  spread,
  toFormData
};
