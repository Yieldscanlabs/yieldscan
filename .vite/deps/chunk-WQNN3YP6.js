import __buffer_polyfill from 'vite-plugin-node-polyfills/shims/buffer'
globalThis.Buffer = globalThis.Buffer || __buffer_polyfill
import __global_polyfill from 'vite-plugin-node-polyfills/shims/global'
globalThis.global = globalThis.global || __global_polyfill
import __process_polyfill from 'vite-plugin-node-polyfills/shims/process'
globalThis.process = globalThis.process || __process_polyfill

import {
  import_index
} from "./chunk-QFU3VH4E.js";
import {
  createStore
} from "./chunk-W2TQ2PN2.js";
import {
  persist,
  subscribeWithSelector
} from "./chunk-D4CIU4OB.js";
import {
  createClient,
  createTransport,
  custom,
  deployContract,
  estimateFeesPerGas,
  estimateGas,
  estimateMaxPriorityFeePerGas,
  fallback,
  getBalance,
  getBlock,
  getBlockNumber,
  getBlockTransactionCount,
  getCallsStatus,
  getCapabilities,
  getCode,
  getEnsAddress,
  getEnsAvatar,
  getEnsName,
  getEnsResolver,
  getEnsText,
  getFeeHistory,
  getGasPrice,
  getProof,
  getStorageAt,
  getTransaction,
  getTransactionConfirmations,
  getTransactionCount,
  getTransactionReceipt,
  multicall,
  prepareTransactionRequest,
  publicActions,
  readContract,
  rpc,
  sendCalls,
  sendTransaction,
  showCallsStatus,
  signMessage,
  signTypedData,
  simulateContract,
  verifyMessage2 as verifyMessage,
  verifyTypedData2 as verifyTypedData,
  waitForCallsStatus,
  waitForTransactionReceipt,
  walletActions,
  watchAsset,
  watchBlockNumber,
  watchBlocks,
  watchContractEvent,
  watchPendingTransactions,
  withRetry,
  withTimeout,
  writeContract
} from "./chunk-YNGIPBDT.js";
import {
  call
} from "./chunk-OJZU56EP.js";
import {
  ChainDisconnectedError,
  ContractFunctionExecutionError,
  ProviderDisconnectedError,
  ResourceUnavailableRpcError,
  RpcRequestError,
  SwitchChainError,
  UserRejectedRequestError,
  formatUnits,
  fromHex,
  getAddress,
  hexToNumber,
  hexToString,
  keccak256,
  numberToHex,
  parseAccount,
  stringToHex,
  trim,
  weiUnits
} from "./chunk-YKXGW6GC.js";
import {
  __toESM,
  require_dist,
  require_dist2,
  require_dist3
} from "./chunk-I22A42VH.js";

// node_modules/@wagmi/core/dist/esm/errors/config.js
var import_dist10 = __toESM(require_dist(), 1);
var import_dist11 = __toESM(require_dist2(), 1);
var import_dist12 = __toESM(require_dist3(), 1);

// node_modules/@wagmi/core/dist/esm/errors/base.js
var import_dist7 = __toESM(require_dist(), 1);
var import_dist8 = __toESM(require_dist2(), 1);
var import_dist9 = __toESM(require_dist3(), 1);

// node_modules/@wagmi/core/dist/esm/utils/getVersion.js
var import_dist4 = __toESM(require_dist(), 1);
var import_dist5 = __toESM(require_dist2(), 1);
var import_dist6 = __toESM(require_dist3(), 1);

// node_modules/@wagmi/core/dist/esm/version.js
var import_dist = __toESM(require_dist(), 1);
var import_dist2 = __toESM(require_dist2(), 1);
var import_dist3 = __toESM(require_dist3(), 1);
var version = "2.17.1";

// node_modules/@wagmi/core/dist/esm/utils/getVersion.js
var getVersion = () => `@wagmi/core@${version}`;

// node_modules/@wagmi/core/dist/esm/errors/base.js
var __classPrivateFieldGet = function(receiver, state, kind, f) {
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _BaseError_instances;
var _BaseError_walk;
var BaseError = class _BaseError extends Error {
  get docsBaseUrl() {
    return "https://wagmi.sh/core";
  }
  get version() {
    return getVersion();
  }
  constructor(shortMessage, options = {}) {
    var _a;
    super();
    _BaseError_instances.add(this);
    Object.defineProperty(this, "details", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "docsPath", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "metaMessages", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "shortMessage", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "WagmiCoreError"
    });
    const details = options.cause instanceof _BaseError ? options.cause.details : ((_a = options.cause) == null ? void 0 : _a.message) ? options.cause.message : options.details;
    const docsPath = options.cause instanceof _BaseError ? options.cause.docsPath || options.docsPath : options.docsPath;
    this.message = [
      shortMessage || "An error occurred.",
      "",
      ...options.metaMessages ? [...options.metaMessages, ""] : [],
      ...docsPath ? [
        `Docs: ${this.docsBaseUrl}${docsPath}.html${options.docsSlug ? `#${options.docsSlug}` : ""}`
      ] : [],
      ...details ? [`Details: ${details}`] : [],
      `Version: ${this.version}`
    ].join("\n");
    if (options.cause)
      this.cause = options.cause;
    this.details = details;
    this.docsPath = docsPath;
    this.metaMessages = options.metaMessages;
    this.shortMessage = shortMessage;
  }
  walk(fn) {
    return __classPrivateFieldGet(this, _BaseError_instances, "m", _BaseError_walk).call(this, this, fn);
  }
};
_BaseError_instances = /* @__PURE__ */ new WeakSet(), _BaseError_walk = function _BaseError_walk2(err, fn) {
  if (fn == null ? void 0 : fn(err))
    return err;
  if (err.cause)
    return __classPrivateFieldGet(this, _BaseError_instances, "m", _BaseError_walk2).call(this, err.cause, fn);
  return err;
};

// node_modules/@wagmi/core/dist/esm/errors/config.js
var ChainNotConfiguredError = class extends BaseError {
  constructor() {
    super("Chain not configured.");
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "ChainNotConfiguredError"
    });
  }
};
var ConnectorAlreadyConnectedError = class extends BaseError {
  constructor() {
    super("Connector already connected.");
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "ConnectorAlreadyConnectedError"
    });
  }
};
var ConnectorNotConnectedError = class extends BaseError {
  constructor() {
    super("Connector not connected.");
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "ConnectorNotConnectedError"
    });
  }
};
var ConnectorNotFoundError = class extends BaseError {
  constructor() {
    super("Connector not found.");
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "ConnectorNotFoundError"
    });
  }
};
var ConnectorAccountNotFoundError = class extends BaseError {
  constructor({ address, connector }) {
    super(`Account "${address}" not found for connector "${connector.name}".`);
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "ConnectorAccountNotFoundError"
    });
  }
};
var ConnectorChainMismatchError = class extends BaseError {
  constructor({ connectionChainId, connectorChainId }) {
    super(`The current chain of the connector (id: ${connectorChainId}) does not match the connection's chain (id: ${connectionChainId}).`, {
      metaMessages: [
        `Current Chain ID:  ${connectorChainId}`,
        `Expected Chain ID: ${connectionChainId}`
      ]
    });
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "ConnectorChainMismatchError"
    });
  }
};
var ConnectorUnavailableReconnectingError = class extends BaseError {
  constructor({ connector }) {
    super(`Connector "${connector.name}" unavailable while reconnecting.`, {
      details: [
        "During the reconnection step, the only connector methods guaranteed to be available are: `id`, `name`, `type`, `uid`.",
        "All other methods are not guaranteed to be available until reconnection completes and connectors are fully restored.",
        "This error commonly occurs for connectors that asynchronously inject after reconnection has already started."
      ].join(" ")
    });
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "ConnectorUnavailableReconnectingError"
    });
  }
};

// node_modules/@wagmi/core/dist/esm/utils/deepEqual.js
var import_dist13 = __toESM(require_dist(), 1);
var import_dist14 = __toESM(require_dist2(), 1);
var import_dist15 = __toESM(require_dist3(), 1);
function deepEqual(a, b) {
  if (a === b)
    return true;
  if (a && b && typeof a === "object" && typeof b === "object") {
    if (a.constructor !== b.constructor)
      return false;
    let length;
    let i;
    if (Array.isArray(a) && Array.isArray(b)) {
      length = a.length;
      if (length !== b.length)
        return false;
      for (i = length; i-- !== 0; )
        if (!deepEqual(a[i], b[i]))
          return false;
      return true;
    }
    if (a.valueOf !== Object.prototype.valueOf)
      return a.valueOf() === b.valueOf();
    if (a.toString !== Object.prototype.toString)
      return a.toString() === b.toString();
    const keys = Object.keys(a);
    length = keys.length;
    if (length !== Object.keys(b).length)
      return false;
    for (i = length; i-- !== 0; )
      if (!Object.prototype.hasOwnProperty.call(b, keys[i]))
        return false;
    for (i = length; i-- !== 0; ) {
      const key = keys[i];
      if (key && !deepEqual(a[key], b[key]))
        return false;
    }
    return true;
  }
  return a !== a && b !== b;
}

// node_modules/@wagmi/core/dist/esm/errors/connector.js
var import_dist16 = __toESM(require_dist(), 1);
var import_dist17 = __toESM(require_dist2(), 1);
var import_dist18 = __toESM(require_dist3(), 1);
var ProviderNotFoundError = class extends BaseError {
  constructor() {
    super("Provider not found.");
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "ProviderNotFoundError"
    });
  }
};
var SwitchChainNotSupportedError = class extends BaseError {
  constructor({ connector }) {
    super(`"${connector.name}" does not support programmatic chain switching.`);
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "SwitchChainNotSupportedError"
    });
  }
};

// node_modules/@wagmi/core/dist/esm/connectors/createConnector.js
var import_dist19 = __toESM(require_dist(), 1);
var import_dist20 = __toESM(require_dist2(), 1);
var import_dist21 = __toESM(require_dist3(), 1);
function createConnector(createConnectorFn) {
  return createConnectorFn;
}

// node_modules/@wagmi/core/dist/esm/connectors/injected.js
var import_dist22 = __toESM(require_dist(), 1);
var import_dist23 = __toESM(require_dist2(), 1);
var import_dist24 = __toESM(require_dist3(), 1);
injected.type = "injected";
function injected(parameters = {}) {
  const { shimDisconnect = true, unstable_shimAsyncInject } = parameters;
  function getTarget() {
    const target = parameters.target;
    if (typeof target === "function") {
      const result = target();
      if (result)
        return result;
    }
    if (typeof target === "object")
      return target;
    if (typeof target === "string")
      return {
        ...targetMap[target] ?? {
          id: target,
          name: `${target[0].toUpperCase()}${target.slice(1)}`,
          provider: `is${target[0].toUpperCase()}${target.slice(1)}`
        }
      };
    return {
      id: "injected",
      name: "Injected",
      provider(window2) {
        return window2 == null ? void 0 : window2.ethereum;
      }
    };
  }
  let accountsChanged;
  let chainChanged;
  let connect2;
  let disconnect2;
  return createConnector((config) => ({
    get icon() {
      return getTarget().icon;
    },
    get id() {
      return getTarget().id;
    },
    get name() {
      return getTarget().name;
    },
    /** @deprecated */
    get supportsSimulation() {
      return true;
    },
    type: injected.type,
    async setup() {
      const provider = await this.getProvider();
      if ((provider == null ? void 0 : provider.on) && parameters.target) {
        if (!connect2) {
          connect2 = this.onConnect.bind(this);
          provider.on("connect", connect2);
        }
        if (!accountsChanged) {
          accountsChanged = this.onAccountsChanged.bind(this);
          provider.on("accountsChanged", accountsChanged);
        }
      }
    },
    async connect({ chainId, isReconnecting: isReconnecting2 } = {}) {
      var _a, _b, _c, _d, _e, _f;
      const provider = await this.getProvider();
      if (!provider)
        throw new ProviderNotFoundError();
      let accounts = [];
      if (isReconnecting2)
        accounts = await this.getAccounts().catch(() => []);
      else if (shimDisconnect) {
        try {
          const permissions = await provider.request({
            method: "wallet_requestPermissions",
            params: [{ eth_accounts: {} }]
          });
          accounts = (_d = (_c = (_b = (_a = permissions[0]) == null ? void 0 : _a.caveats) == null ? void 0 : _b[0]) == null ? void 0 : _c.value) == null ? void 0 : _d.map((x) => getAddress(x));
          if (accounts.length > 0) {
            const sortedAccounts = await this.getAccounts();
            accounts = sortedAccounts;
          }
        } catch (err) {
          const error = err;
          if (error.code === UserRejectedRequestError.code)
            throw new UserRejectedRequestError(error);
          if (error.code === ResourceUnavailableRpcError.code)
            throw error;
        }
      }
      try {
        if (!(accounts == null ? void 0 : accounts.length) && !isReconnecting2) {
          const requestedAccounts = await provider.request({
            method: "eth_requestAccounts"
          });
          accounts = requestedAccounts.map((x) => getAddress(x));
        }
        if (connect2) {
          provider.removeListener("connect", connect2);
          connect2 = void 0;
        }
        if (!accountsChanged) {
          accountsChanged = this.onAccountsChanged.bind(this);
          provider.on("accountsChanged", accountsChanged);
        }
        if (!chainChanged) {
          chainChanged = this.onChainChanged.bind(this);
          provider.on("chainChanged", chainChanged);
        }
        if (!disconnect2) {
          disconnect2 = this.onDisconnect.bind(this);
          provider.on("disconnect", disconnect2);
        }
        let currentChainId = await this.getChainId();
        if (chainId && currentChainId !== chainId) {
          const chain = await this.switchChain({ chainId }).catch((error) => {
            if (error.code === UserRejectedRequestError.code)
              throw error;
            return { id: currentChainId };
          });
          currentChainId = (chain == null ? void 0 : chain.id) ?? currentChainId;
        }
        if (shimDisconnect)
          await ((_e = config.storage) == null ? void 0 : _e.removeItem(`${this.id}.disconnected`));
        if (!parameters.target)
          await ((_f = config.storage) == null ? void 0 : _f.setItem("injected.connected", true));
        return { accounts, chainId: currentChainId };
      } catch (err) {
        const error = err;
        if (error.code === UserRejectedRequestError.code)
          throw new UserRejectedRequestError(error);
        if (error.code === ResourceUnavailableRpcError.code)
          throw new ResourceUnavailableRpcError(error);
        throw error;
      }
    },
    async disconnect() {
      var _a, _b;
      const provider = await this.getProvider();
      if (!provider)
        throw new ProviderNotFoundError();
      if (chainChanged) {
        provider.removeListener("chainChanged", chainChanged);
        chainChanged = void 0;
      }
      if (disconnect2) {
        provider.removeListener("disconnect", disconnect2);
        disconnect2 = void 0;
      }
      if (!connect2) {
        connect2 = this.onConnect.bind(this);
        provider.on("connect", connect2);
      }
      try {
        await withTimeout(() => (
          // TODO: Remove explicit type for viem@3
          provider.request({
            // `'wallet_revokePermissions'` added in `viem@2.10.3`
            method: "wallet_revokePermissions",
            params: [{ eth_accounts: {} }]
          })
        ), { timeout: 100 });
      } catch {
      }
      if (shimDisconnect) {
        await ((_a = config.storage) == null ? void 0 : _a.setItem(`${this.id}.disconnected`, true));
      }
      if (!parameters.target)
        await ((_b = config.storage) == null ? void 0 : _b.removeItem("injected.connected"));
    },
    async getAccounts() {
      const provider = await this.getProvider();
      if (!provider)
        throw new ProviderNotFoundError();
      const accounts = await provider.request({ method: "eth_accounts" });
      return accounts.map((x) => getAddress(x));
    },
    async getChainId() {
      const provider = await this.getProvider();
      if (!provider)
        throw new ProviderNotFoundError();
      const hexChainId = await provider.request({ method: "eth_chainId" });
      return Number(hexChainId);
    },
    async getProvider() {
      if (typeof window === "undefined")
        return void 0;
      let provider;
      const target = getTarget();
      if (typeof target.provider === "function")
        provider = target.provider(window);
      else if (typeof target.provider === "string")
        provider = findProvider(window, target.provider);
      else
        provider = target.provider;
      if (provider && !provider.removeListener) {
        if ("off" in provider && typeof provider.off === "function")
          provider.removeListener = provider.off;
        else
          provider.removeListener = () => {
          };
      }
      return provider;
    },
    async isAuthorized() {
      var _a, _b;
      try {
        const isDisconnected = shimDisconnect && // If shim exists in storage, connector is disconnected
        await ((_a = config.storage) == null ? void 0 : _a.getItem(`${this.id}.disconnected`));
        if (isDisconnected)
          return false;
        if (!parameters.target) {
          const connected = await ((_b = config.storage) == null ? void 0 : _b.getItem("injected.connected"));
          if (!connected)
            return false;
        }
        const provider = await this.getProvider();
        if (!provider) {
          if (unstable_shimAsyncInject !== void 0 && unstable_shimAsyncInject !== false) {
            const handleEthereum = async () => {
              if (typeof window !== "undefined")
                window.removeEventListener("ethereum#initialized", handleEthereum);
              const provider2 = await this.getProvider();
              return !!provider2;
            };
            const timeout = typeof unstable_shimAsyncInject === "number" ? unstable_shimAsyncInject : 1e3;
            const res = await Promise.race([
              ...typeof window !== "undefined" ? [
                new Promise((resolve) => window.addEventListener("ethereum#initialized", () => resolve(handleEthereum()), { once: true }))
              ] : [],
              new Promise((resolve) => setTimeout(() => resolve(handleEthereum()), timeout))
            ]);
            if (res)
              return true;
          }
          throw new ProviderNotFoundError();
        }
        const accounts = await withRetry(() => this.getAccounts());
        return !!accounts.length;
      } catch {
        return false;
      }
    },
    async switchChain({ addEthereumChainParameter, chainId }) {
      var _a, _b, _c, _d;
      const provider = await this.getProvider();
      if (!provider)
        throw new ProviderNotFoundError();
      const chain = config.chains.find((x) => x.id === chainId);
      if (!chain)
        throw new SwitchChainError(new ChainNotConfiguredError());
      const promise = new Promise((resolve) => {
        const listener = (data) => {
          if ("chainId" in data && data.chainId === chainId) {
            config.emitter.off("change", listener);
            resolve();
          }
        };
        config.emitter.on("change", listener);
      });
      try {
        await Promise.all([
          provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: numberToHex(chainId) }]
          }).then(async () => {
            const currentChainId = await this.getChainId();
            if (currentChainId === chainId)
              config.emitter.emit("change", { chainId });
          }),
          promise
        ]);
        return chain;
      } catch (err) {
        const error = err;
        if (error.code === 4902 || // Unwrapping for MetaMask Mobile
        // https://github.com/MetaMask/metamask-mobile/issues/2944#issuecomment-976988719
        ((_b = (_a = error == null ? void 0 : error.data) == null ? void 0 : _a.originalError) == null ? void 0 : _b.code) === 4902) {
          try {
            const { default: blockExplorer, ...blockExplorers } = chain.blockExplorers ?? {};
            let blockExplorerUrls;
            if (addEthereumChainParameter == null ? void 0 : addEthereumChainParameter.blockExplorerUrls)
              blockExplorerUrls = addEthereumChainParameter.blockExplorerUrls;
            else if (blockExplorer)
              blockExplorerUrls = [
                blockExplorer.url,
                ...Object.values(blockExplorers).map((x) => x.url)
              ];
            let rpcUrls;
            if ((_c = addEthereumChainParameter == null ? void 0 : addEthereumChainParameter.rpcUrls) == null ? void 0 : _c.length)
              rpcUrls = addEthereumChainParameter.rpcUrls;
            else
              rpcUrls = [((_d = chain.rpcUrls.default) == null ? void 0 : _d.http[0]) ?? ""];
            const addEthereumChain = {
              blockExplorerUrls,
              chainId: numberToHex(chainId),
              chainName: (addEthereumChainParameter == null ? void 0 : addEthereumChainParameter.chainName) ?? chain.name,
              iconUrls: addEthereumChainParameter == null ? void 0 : addEthereumChainParameter.iconUrls,
              nativeCurrency: (addEthereumChainParameter == null ? void 0 : addEthereumChainParameter.nativeCurrency) ?? chain.nativeCurrency,
              rpcUrls
            };
            await Promise.all([
              provider.request({
                method: "wallet_addEthereumChain",
                params: [addEthereumChain]
              }).then(async () => {
                const currentChainId = await this.getChainId();
                if (currentChainId === chainId)
                  config.emitter.emit("change", { chainId });
                else
                  throw new UserRejectedRequestError(new Error("User rejected switch after adding network."));
              }),
              promise
            ]);
            return chain;
          } catch (error2) {
            throw new UserRejectedRequestError(error2);
          }
        }
        if (error.code === UserRejectedRequestError.code)
          throw new UserRejectedRequestError(error);
        throw new SwitchChainError(error);
      }
    },
    async onAccountsChanged(accounts) {
      var _a;
      if (accounts.length === 0)
        this.onDisconnect();
      else if (config.emitter.listenerCount("connect")) {
        const chainId = (await this.getChainId()).toString();
        this.onConnect({ chainId });
        if (shimDisconnect)
          await ((_a = config.storage) == null ? void 0 : _a.removeItem(`${this.id}.disconnected`));
      } else
        config.emitter.emit("change", {
          accounts: accounts.map((x) => getAddress(x))
        });
    },
    onChainChanged(chain) {
      const chainId = Number(chain);
      config.emitter.emit("change", { chainId });
    },
    async onConnect(connectInfo) {
      const accounts = await this.getAccounts();
      if (accounts.length === 0)
        return;
      const chainId = Number(connectInfo.chainId);
      config.emitter.emit("connect", { accounts, chainId });
      const provider = await this.getProvider();
      if (provider) {
        if (connect2) {
          provider.removeListener("connect", connect2);
          connect2 = void 0;
        }
        if (!accountsChanged) {
          accountsChanged = this.onAccountsChanged.bind(this);
          provider.on("accountsChanged", accountsChanged);
        }
        if (!chainChanged) {
          chainChanged = this.onChainChanged.bind(this);
          provider.on("chainChanged", chainChanged);
        }
        if (!disconnect2) {
          disconnect2 = this.onDisconnect.bind(this);
          provider.on("disconnect", disconnect2);
        }
      }
    },
    async onDisconnect(error) {
      const provider = await this.getProvider();
      if (error && error.code === 1013) {
        if (provider && !!(await this.getAccounts()).length)
          return;
      }
      config.emitter.emit("disconnect");
      if (provider) {
        if (chainChanged) {
          provider.removeListener("chainChanged", chainChanged);
          chainChanged = void 0;
        }
        if (disconnect2) {
          provider.removeListener("disconnect", disconnect2);
          disconnect2 = void 0;
        }
        if (!connect2) {
          connect2 = this.onConnect.bind(this);
          provider.on("connect", connect2);
        }
      }
    }
  }));
}
var targetMap = {
  coinbaseWallet: {
    id: "coinbaseWallet",
    name: "Coinbase Wallet",
    provider(window2) {
      if (window2 == null ? void 0 : window2.coinbaseWalletExtension)
        return window2.coinbaseWalletExtension;
      return findProvider(window2, "isCoinbaseWallet");
    }
  },
  metaMask: {
    id: "metaMask",
    name: "MetaMask",
    provider(window2) {
      return findProvider(window2, (provider) => {
        if (!provider.isMetaMask)
          return false;
        if (provider.isBraveWallet && !provider._events && !provider._state)
          return false;
        const flags = [
          "isApexWallet",
          "isAvalanche",
          "isBitKeep",
          "isBlockWallet",
          "isKuCoinWallet",
          "isMathWallet",
          "isOkxWallet",
          "isOKExWallet",
          "isOneInchIOSWallet",
          "isOneInchAndroidWallet",
          "isOpera",
          "isPhantom",
          "isPortal",
          "isRabby",
          "isTokenPocket",
          "isTokenary",
          "isUniswapWallet",
          "isZerion"
        ];
        for (const flag of flags)
          if (provider[flag])
            return false;
        return true;
      });
    }
  },
  phantom: {
    id: "phantom",
    name: "Phantom",
    provider(window2) {
      var _a, _b;
      if ((_a = window2 == null ? void 0 : window2.phantom) == null ? void 0 : _a.ethereum)
        return (_b = window2.phantom) == null ? void 0 : _b.ethereum;
      return findProvider(window2, "isPhantom");
    }
  }
};
function findProvider(window2, select) {
  function isProvider(provider) {
    if (typeof select === "function")
      return select(provider);
    if (typeof select === "string")
      return provider[select];
    return true;
  }
  const ethereum = window2.ethereum;
  if (ethereum == null ? void 0 : ethereum.providers)
    return ethereum.providers.find((provider) => isProvider(provider));
  if (ethereum && isProvider(ethereum))
    return ethereum;
  return void 0;
}

// node_modules/@wagmi/core/dist/esm/connectors/mock.js
var import_dist25 = __toESM(require_dist(), 1);
var import_dist26 = __toESM(require_dist2(), 1);
var import_dist27 = __toESM(require_dist3(), 1);
mock.type = "mock";
function mock(parameters) {
  const transactionCache = /* @__PURE__ */ new Map();
  const features = parameters.features ?? { defaultConnected: false };
  let connected = features.defaultConnected;
  let connectedChainId;
  return createConnector((config) => ({
    id: "mock",
    name: "Mock Connector",
    type: mock.type,
    async setup() {
      connectedChainId = config.chains[0].id;
    },
    async connect({ chainId } = {}) {
      if (features.connectError) {
        if (typeof features.connectError === "boolean")
          throw new UserRejectedRequestError(new Error("Failed to connect."));
        throw features.connectError;
      }
      const provider = await this.getProvider();
      const accounts = await provider.request({
        method: "eth_requestAccounts"
      });
      let currentChainId = await this.getChainId();
      if (chainId && currentChainId !== chainId) {
        const chain = await this.switchChain({ chainId });
        currentChainId = chain.id;
      }
      connected = true;
      return {
        accounts: accounts.map((x) => getAddress(x)),
        chainId: currentChainId
      };
    },
    async disconnect() {
      connected = false;
    },
    async getAccounts() {
      if (!connected)
        throw new ConnectorNotConnectedError();
      const provider = await this.getProvider();
      const accounts = await provider.request({ method: "eth_accounts" });
      return accounts.map((x) => getAddress(x));
    },
    async getChainId() {
      const provider = await this.getProvider();
      const hexChainId = await provider.request({ method: "eth_chainId" });
      return fromHex(hexChainId, "number");
    },
    async isAuthorized() {
      if (!features.reconnect)
        return false;
      if (!connected)
        return false;
      const accounts = await this.getAccounts();
      return !!accounts.length;
    },
    async switchChain({ chainId }) {
      const provider = await this.getProvider();
      const chain = config.chains.find((x) => x.id === chainId);
      if (!chain)
        throw new SwitchChainError(new ChainNotConfiguredError());
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: numberToHex(chainId) }]
      });
      return chain;
    },
    onAccountsChanged(accounts) {
      if (accounts.length === 0)
        this.onDisconnect();
      else
        config.emitter.emit("change", {
          accounts: accounts.map((x) => getAddress(x))
        });
    },
    onChainChanged(chain) {
      const chainId = Number(chain);
      config.emitter.emit("change", { chainId });
    },
    async onDisconnect(_error) {
      config.emitter.emit("disconnect");
      connected = false;
    },
    async getProvider({ chainId } = {}) {
      const chain = config.chains.find((x) => x.id === chainId) ?? config.chains[0];
      const url = chain.rpcUrls.default.http[0];
      const request = async ({ method, params }) => {
        if (method === "eth_chainId")
          return numberToHex(connectedChainId);
        if (method === "eth_requestAccounts")
          return parameters.accounts;
        if (method === "eth_signTypedData_v4") {
          if (features.signTypedDataError) {
            if (typeof features.signTypedDataError === "boolean")
              throw new UserRejectedRequestError(new Error("Failed to sign typed data."));
            throw features.signTypedDataError;
          }
        }
        if (method === "wallet_switchEthereumChain") {
          if (features.switchChainError) {
            if (typeof features.switchChainError === "boolean")
              throw new UserRejectedRequestError(new Error("Failed to switch chain."));
            throw features.switchChainError;
          }
          connectedChainId = fromHex(params[0].chainId, "number");
          this.onChainChanged(connectedChainId.toString());
          return;
        }
        if (method === "wallet_watchAsset") {
          if (features.watchAssetError) {
            if (typeof features.watchAssetError === "boolean")
              throw new UserRejectedRequestError(new Error("Failed to switch chain."));
            throw features.watchAssetError;
          }
          return connected;
        }
        if (method === "wallet_getCapabilities")
          return {
            "0x2105": {
              paymasterService: {
                supported: params[0] === "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
              },
              sessionKeys: {
                supported: true
              }
            },
            "0x14A34": {
              paymasterService: {
                supported: params[0] === "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
              }
            }
          };
        if (method === "wallet_sendCalls") {
          const hashes = [];
          const calls = params[0].calls;
          for (const call3 of calls) {
            const { result: result2, error: error2 } = await rpc.http(url, {
              body: {
                method: "eth_sendTransaction",
                params: [call3]
              }
            });
            if (error2)
              throw new RpcRequestError({
                body: { method, params },
                error: error2,
                url
              });
            hashes.push(result2);
          }
          const id = keccak256(stringToHex(JSON.stringify(calls)));
          transactionCache.set(id, hashes);
          return { id };
        }
        if (method === "wallet_getCallsStatus") {
          const hashes = transactionCache.get(params[0]);
          if (!hashes)
            return {
              atomic: false,
              chainId: "0x1",
              id: params[0],
              status: 100,
              receipts: [],
              version: "2.0.0"
            };
          const receipts = await Promise.all(hashes.map(async (hash) => {
            const { result: result2, error: error2 } = await rpc.http(url, {
              body: {
                method: "eth_getTransactionReceipt",
                params: [hash],
                id: 0
              }
            });
            if (error2)
              throw new RpcRequestError({
                body: { method, params },
                error: error2,
                url
              });
            if (!result2)
              return null;
            return {
              blockHash: result2.blockHash,
              blockNumber: result2.blockNumber,
              gasUsed: result2.gasUsed,
              logs: result2.logs,
              status: result2.status,
              transactionHash: result2.transactionHash
            };
          }));
          const receipts_ = receipts.filter((x) => x !== null);
          if (receipts_.length === 0)
            return {
              atomic: false,
              chainId: "0x1",
              id: params[0],
              status: 100,
              receipts: [],
              version: "2.0.0"
            };
          return {
            atomic: false,
            chainId: "0x1",
            id: params[0],
            status: 200,
            receipts: receipts_,
            version: "2.0.0"
          };
        }
        if (method === "wallet_showCallsStatus")
          return;
        if (method === "personal_sign") {
          if (features.signMessageError) {
            if (typeof features.signMessageError === "boolean")
              throw new UserRejectedRequestError(new Error("Failed to sign message."));
            throw features.signMessageError;
          }
          method = "eth_sign";
          params = [params[1], params[0]];
        }
        const body = { method, params };
        const { error, result } = await rpc.http(url, { body });
        if (error)
          throw new RpcRequestError({ body, error, url });
        return result;
      };
      return custom({ request })({ retryCount: 0 });
    }
  }));
}

// node_modules/@wagmi/core/dist/esm/utils/deserialize.js
var import_dist28 = __toESM(require_dist(), 1);
var import_dist29 = __toESM(require_dist2(), 1);
var import_dist30 = __toESM(require_dist3(), 1);
function deserialize(value, reviver) {
  return JSON.parse(value, (key, value_) => {
    let value2 = value_;
    if ((value2 == null ? void 0 : value2.__type) === "bigint")
      value2 = BigInt(value2.value);
    if ((value2 == null ? void 0 : value2.__type) === "Map")
      value2 = new Map(value2.value);
    return (reviver == null ? void 0 : reviver(key, value2)) ?? value2;
  });
}

// node_modules/@wagmi/core/dist/esm/utils/serialize.js
var import_dist31 = __toESM(require_dist(), 1);
var import_dist32 = __toESM(require_dist2(), 1);
var import_dist33 = __toESM(require_dist3(), 1);
function getReferenceKey(keys, cutoff) {
  return keys.slice(0, cutoff).join(".") || ".";
}
function getCutoff(array, value) {
  const { length } = array;
  for (let index2 = 0; index2 < length; ++index2) {
    if (array[index2] === value) {
      return index2 + 1;
    }
  }
  return 0;
}
function createReplacer(replacer, circularReplacer) {
  const hasReplacer = typeof replacer === "function";
  const hasCircularReplacer = typeof circularReplacer === "function";
  const cache = [];
  const keys = [];
  return function replace(key, value) {
    if (typeof value === "object") {
      if (cache.length) {
        const thisCutoff = getCutoff(cache, this);
        if (thisCutoff === 0) {
          cache[cache.length] = this;
        } else {
          cache.splice(thisCutoff);
          keys.splice(thisCutoff);
        }
        keys[keys.length] = key;
        const valueCutoff = getCutoff(cache, value);
        if (valueCutoff !== 0) {
          return hasCircularReplacer ? circularReplacer.call(this, key, value, getReferenceKey(keys, valueCutoff)) : `[ref=${getReferenceKey(keys, valueCutoff)}]`;
        }
      } else {
        cache[0] = value;
        keys[0] = key;
      }
    }
    return hasReplacer ? replacer.call(this, key, value) : value;
  };
}
function serialize(value, replacer, indent, circularReplacer) {
  return JSON.stringify(value, createReplacer((key, value_) => {
    let value2 = value_;
    if (typeof value2 === "bigint")
      value2 = { __type: "bigint", value: value_.toString() };
    if (value2 instanceof Map)
      value2 = { __type: "Map", value: Array.from(value_.entries()) };
    return (replacer == null ? void 0 : replacer(key, value2)) ?? value2;
  }, circularReplacer), indent ?? void 0);
}

// node_modules/@wagmi/core/dist/esm/createStorage.js
var import_dist34 = __toESM(require_dist(), 1);
var import_dist35 = __toESM(require_dist2(), 1);
var import_dist36 = __toESM(require_dist3(), 1);
function createStorage(parameters) {
  const { deserialize: deserialize2 = deserialize, key: prefix = "wagmi", serialize: serialize2 = serialize, storage = noopStorage } = parameters;
  function unwrap(value) {
    if (value instanceof Promise)
      return value.then((x) => x).catch(() => null);
    return value;
  }
  return {
    ...storage,
    key: prefix,
    async getItem(key, defaultValue) {
      const value = storage.getItem(`${prefix}.${key}`);
      const unwrapped = await unwrap(value);
      if (unwrapped)
        return deserialize2(unwrapped) ?? null;
      return defaultValue ?? null;
    },
    async setItem(key, value) {
      const storageKey = `${prefix}.${key}`;
      if (value === null)
        await unwrap(storage.removeItem(storageKey));
      else
        await unwrap(storage.setItem(storageKey, serialize2(value)));
    },
    async removeItem(key) {
      await unwrap(storage.removeItem(`${prefix}.${key}`));
    }
  };
}
var noopStorage = {
  getItem: () => null,
  setItem: () => {
  },
  removeItem: () => {
  }
};
function getDefaultStorage() {
  const storage = (() => {
    if (typeof window !== "undefined" && window.localStorage)
      return window.localStorage;
    return noopStorage;
  })();
  return {
    getItem(key) {
      return storage.getItem(key);
    },
    removeItem(key) {
      storage.removeItem(key);
    },
    setItem(key, value) {
      try {
        storage.setItem(key, value);
      } catch {
      }
    }
  };
}

// node_modules/@wagmi/core/dist/esm/createConfig.js
var import_dist52 = __toESM(require_dist(), 1);
var import_dist53 = __toESM(require_dist2(), 1);
var import_dist54 = __toESM(require_dist3(), 1);

// node_modules/mipd/dist/esm/index.js
var import_dist43 = __toESM(require_dist());
var import_dist44 = __toESM(require_dist2());
var import_dist45 = __toESM(require_dist3());

// node_modules/mipd/dist/esm/store.js
var import_dist40 = __toESM(require_dist(), 1);
var import_dist41 = __toESM(require_dist2(), 1);
var import_dist42 = __toESM(require_dist3(), 1);

// node_modules/mipd/dist/esm/utils.js
var import_dist37 = __toESM(require_dist(), 1);
var import_dist38 = __toESM(require_dist2(), 1);
var import_dist39 = __toESM(require_dist3(), 1);
function requestProviders(listener) {
  if (typeof window === "undefined")
    return;
  const handler = (event) => listener(event.detail);
  window.addEventListener("eip6963:announceProvider", handler);
  window.dispatchEvent(new CustomEvent("eip6963:requestProvider"));
  return () => window.removeEventListener("eip6963:announceProvider", handler);
}

// node_modules/mipd/dist/esm/store.js
function createStore2() {
  const listeners = /* @__PURE__ */ new Set();
  let providerDetails = [];
  const request = () => requestProviders((providerDetail) => {
    if (providerDetails.some(({ info }) => info.uuid === providerDetail.info.uuid))
      return;
    providerDetails = [...providerDetails, providerDetail];
    listeners.forEach((listener) => listener(providerDetails, { added: [providerDetail] }));
  });
  let unwatch = request();
  return {
    _listeners() {
      return listeners;
    },
    clear() {
      listeners.forEach((listener) => listener([], { removed: [...providerDetails] }));
      providerDetails = [];
    },
    destroy() {
      this.clear();
      listeners.clear();
      unwatch == null ? void 0 : unwatch();
    },
    findProvider({ rdns }) {
      return providerDetails.find((providerDetail) => providerDetail.info.rdns === rdns);
    },
    getProviders() {
      return providerDetails;
    },
    reset() {
      this.clear();
      unwatch == null ? void 0 : unwatch();
      unwatch = request();
    },
    subscribe(listener, { emitImmediately } = {}) {
      listeners.add(listener);
      if (emitImmediately)
        listener(providerDetails, { added: providerDetails });
      return () => listeners.delete(listener);
    }
  };
}

// node_modules/@wagmi/core/dist/esm/createEmitter.js
var import_dist46 = __toESM(require_dist(), 1);
var import_dist47 = __toESM(require_dist2(), 1);
var import_dist48 = __toESM(require_dist3(), 1);
var Emitter = class {
  constructor(uid2) {
    Object.defineProperty(this, "uid", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: uid2
    });
    Object.defineProperty(this, "_emitter", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: new import_index.default()
    });
  }
  on(eventName, fn) {
    this._emitter.on(eventName, fn);
  }
  once(eventName, fn) {
    this._emitter.once(eventName, fn);
  }
  off(eventName, fn) {
    this._emitter.off(eventName, fn);
  }
  emit(eventName, ...params) {
    const data = params[0];
    this._emitter.emit(eventName, { uid: this.uid, ...data });
  }
  listenerCount(eventName) {
    return this._emitter.listenerCount(eventName);
  }
};
function createEmitter(uid2) {
  return new Emitter(uid2);
}

// node_modules/@wagmi/core/dist/esm/utils/uid.js
var import_dist49 = __toESM(require_dist(), 1);
var import_dist50 = __toESM(require_dist2(), 1);
var import_dist51 = __toESM(require_dist3(), 1);
var size = 256;
var index = size;
var buffer;
function uid(length = 11) {
  if (!buffer || index + length > size * 2) {
    buffer = "";
    index = 0;
    for (let i = 0; i < size; i++) {
      buffer += (256 + Math.random() * 256 | 0).toString(16).substring(1);
    }
  }
  return buffer.substring(index, index++ + length);
}

// node_modules/@wagmi/core/dist/esm/createConfig.js
function createConfig(parameters) {
  const { multiInjectedProviderDiscovery = true, storage = createStorage({
    storage: getDefaultStorage()
  }), syncConnectedChain = true, ssr = false, ...rest } = parameters;
  const mipd = typeof window !== "undefined" && multiInjectedProviderDiscovery ? createStore2() : void 0;
  const chains = createStore(() => rest.chains);
  const connectors = createStore(() => {
    const collection = [];
    const rdnsSet = /* @__PURE__ */ new Set();
    for (const connectorFns of rest.connectors ?? []) {
      const connector = setup(connectorFns);
      collection.push(connector);
      if (!ssr && connector.rdns) {
        const rdnsValues = typeof connector.rdns === "string" ? [connector.rdns] : connector.rdns;
        for (const rdns of rdnsValues) {
          rdnsSet.add(rdns);
        }
      }
    }
    if (!ssr && mipd) {
      const providers = mipd.getProviders();
      for (const provider of providers) {
        if (rdnsSet.has(provider.info.rdns))
          continue;
        collection.push(setup(providerDetailToConnector(provider)));
      }
    }
    return collection;
  });
  function setup(connectorFn) {
    var _a;
    const emitter = createEmitter(uid());
    const connector = {
      ...connectorFn({
        emitter,
        chains: chains.getState(),
        storage,
        transports: rest.transports
      }),
      emitter,
      uid: emitter.uid
    };
    emitter.on("connect", connect2);
    (_a = connector.setup) == null ? void 0 : _a.call(connector);
    return connector;
  }
  function providerDetailToConnector(providerDetail) {
    const { info } = providerDetail;
    const provider = providerDetail.provider;
    return injected({ target: { ...info, id: info.rdns, provider } });
  }
  const clients = /* @__PURE__ */ new Map();
  function getClient2(config = {}) {
    const chainId = config.chainId ?? store.getState().chainId;
    const chain = chains.getState().find((x) => x.id === chainId);
    if (config.chainId && !chain)
      throw new ChainNotConfiguredError();
    {
      const client2 = clients.get(store.getState().chainId);
      if (client2 && !chain)
        return client2;
      if (!chain)
        throw new ChainNotConfiguredError();
    }
    {
      const client2 = clients.get(chainId);
      if (client2)
        return client2;
    }
    let client;
    if (rest.client)
      client = rest.client({ chain });
    else {
      const chainId2 = chain.id;
      const chainIds = chains.getState().map((x) => x.id);
      const properties = {};
      const entries = Object.entries(rest);
      for (const [key, value] of entries) {
        if (key === "chains" || key === "client" || key === "connectors" || key === "transports")
          continue;
        if (typeof value === "object") {
          if (chainId2 in value)
            properties[key] = value[chainId2];
          else {
            const hasChainSpecificValue = chainIds.some((x) => x in value);
            if (hasChainSpecificValue)
              continue;
            properties[key] = value;
          }
        } else
          properties[key] = value;
      }
      client = createClient({
        ...properties,
        chain,
        batch: properties.batch ?? { multicall: true },
        transport: (parameters2) => rest.transports[chainId2]({ ...parameters2, connectors })
      });
    }
    clients.set(chainId, client);
    return client;
  }
  function getInitialState() {
    return {
      chainId: chains.getState()[0].id,
      connections: /* @__PURE__ */ new Map(),
      current: null,
      status: "disconnected"
    };
  }
  let currentVersion;
  const prefix = "0.0.0-canary-";
  if (version.startsWith(prefix))
    currentVersion = Number.parseInt(version.replace(prefix, ""));
  else
    currentVersion = Number.parseInt(version.split(".")[0] ?? "0");
  const store = createStore(subscribeWithSelector(
    // only use persist middleware if storage exists
    storage ? persist(getInitialState, {
      migrate(persistedState, version2) {
        if (version2 === currentVersion)
          return persistedState;
        const initialState = getInitialState();
        const chainId = validatePersistedChainId(persistedState, initialState.chainId);
        return { ...initialState, chainId };
      },
      name: "store",
      partialize(state) {
        return {
          connections: {
            __type: "Map",
            value: Array.from(state.connections.entries()).map(([key, connection]) => {
              const { id, name, type, uid: uid2 } = connection.connector;
              const connector = { id, name, type, uid: uid2 };
              return [key, { ...connection, connector }];
            })
          },
          chainId: state.chainId,
          current: state.current
        };
      },
      merge(persistedState, currentState) {
        if (typeof persistedState === "object" && persistedState && "status" in persistedState)
          delete persistedState.status;
        const chainId = validatePersistedChainId(persistedState, currentState.chainId);
        return {
          ...currentState,
          ...persistedState,
          chainId
        };
      },
      skipHydration: ssr,
      storage,
      version: currentVersion
    }) : getInitialState
  ));
  store.setState(getInitialState());
  function validatePersistedChainId(persistedState, defaultChainId) {
    return persistedState && typeof persistedState === "object" && "chainId" in persistedState && typeof persistedState.chainId === "number" && chains.getState().some((x) => x.id === persistedState.chainId) ? persistedState.chainId : defaultChainId;
  }
  if (syncConnectedChain)
    store.subscribe(({ connections, current }) => {
      var _a;
      return current ? (_a = connections.get(current)) == null ? void 0 : _a.chainId : void 0;
    }, (chainId) => {
      const isChainConfigured = chains.getState().some((x) => x.id === chainId);
      if (!isChainConfigured)
        return;
      return store.setState((x) => ({
        ...x,
        chainId: chainId ?? x.chainId
      }));
    });
  mipd == null ? void 0 : mipd.subscribe((providerDetails) => {
    const connectorIdSet = /* @__PURE__ */ new Set();
    const connectorRdnsSet = /* @__PURE__ */ new Set();
    for (const connector of connectors.getState()) {
      connectorIdSet.add(connector.id);
      if (connector.rdns) {
        const rdnsValues = typeof connector.rdns === "string" ? [connector.rdns] : connector.rdns;
        for (const rdns of rdnsValues) {
          connectorRdnsSet.add(rdns);
        }
      }
    }
    const newConnectors = [];
    for (const providerDetail of providerDetails) {
      if (connectorRdnsSet.has(providerDetail.info.rdns))
        continue;
      const connector = setup(providerDetailToConnector(providerDetail));
      if (connectorIdSet.has(connector.id))
        continue;
      newConnectors.push(connector);
    }
    if (storage && !store.persist.hasHydrated())
      return;
    connectors.setState((x) => [...x, ...newConnectors], true);
  });
  function change(data) {
    store.setState((x) => {
      const connection = x.connections.get(data.uid);
      if (!connection)
        return x;
      return {
        ...x,
        connections: new Map(x.connections).set(data.uid, {
          accounts: data.accounts ?? connection.accounts,
          chainId: data.chainId ?? connection.chainId,
          connector: connection.connector
        })
      };
    });
  }
  function connect2(data) {
    if (store.getState().status === "connecting" || store.getState().status === "reconnecting")
      return;
    store.setState((x) => {
      const connector = connectors.getState().find((x2) => x2.uid === data.uid);
      if (!connector)
        return x;
      if (connector.emitter.listenerCount("connect"))
        connector.emitter.off("connect", change);
      if (!connector.emitter.listenerCount("change"))
        connector.emitter.on("change", change);
      if (!connector.emitter.listenerCount("disconnect"))
        connector.emitter.on("disconnect", disconnect2);
      return {
        ...x,
        connections: new Map(x.connections).set(data.uid, {
          accounts: data.accounts,
          chainId: data.chainId,
          connector
        }),
        current: data.uid,
        status: "connected"
      };
    });
  }
  function disconnect2(data) {
    store.setState((x) => {
      const connection = x.connections.get(data.uid);
      if (connection) {
        const connector = connection.connector;
        if (connector.emitter.listenerCount("change"))
          connection.connector.emitter.off("change", change);
        if (connector.emitter.listenerCount("disconnect"))
          connection.connector.emitter.off("disconnect", disconnect2);
        if (!connector.emitter.listenerCount("connect"))
          connection.connector.emitter.on("connect", connect2);
      }
      x.connections.delete(data.uid);
      if (x.connections.size === 0)
        return {
          ...x,
          connections: /* @__PURE__ */ new Map(),
          current: null,
          status: "disconnected"
        };
      const nextConnection = x.connections.values().next().value;
      return {
        ...x,
        connections: new Map(x.connections),
        current: nextConnection.connector.uid
      };
    });
  }
  return {
    get chains() {
      return chains.getState();
    },
    get connectors() {
      return connectors.getState();
    },
    storage,
    getClient: getClient2,
    get state() {
      return store.getState();
    },
    setState(value) {
      let newState;
      if (typeof value === "function")
        newState = value(store.getState());
      else
        newState = value;
      const initialState = getInitialState();
      if (typeof newState !== "object")
        newState = initialState;
      const isCorrupt = Object.keys(initialState).some((x) => !(x in newState));
      if (isCorrupt)
        newState = initialState;
      store.setState(newState, true);
    },
    subscribe(selector, listener, options) {
      return store.subscribe(selector, listener, options ? {
        ...options,
        fireImmediately: options.emitImmediately
        // Workaround cast since Zustand does not support `'exactOptionalPropertyTypes'`
      } : void 0);
    },
    _internal: {
      mipd,
      store,
      ssr: Boolean(ssr),
      syncConnectedChain,
      transports: rest.transports,
      chains: {
        setState(value) {
          const nextChains = typeof value === "function" ? value(chains.getState()) : value;
          if (nextChains.length === 0)
            return;
          return chains.setState(nextChains, true);
        },
        subscribe(listener) {
          return chains.subscribe(listener);
        }
      },
      connectors: {
        providerDetailToConnector,
        setup,
        setState(value) {
          return connectors.setState(typeof value === "function" ? value(connectors.getState()) : value, true);
        },
        subscribe(listener) {
          return connectors.subscribe(listener);
        }
      },
      events: { change, connect: connect2, disconnect: disconnect2 }
    }
  };
}

// node_modules/@wagmi/core/dist/esm/transports/connector.js
var import_dist55 = __toESM(require_dist(), 1);
var import_dist56 = __toESM(require_dist2(), 1);
var import_dist57 = __toESM(require_dist3(), 1);
function unstable_connector(connector, config = {}) {
  const { type } = connector;
  const { key = "connector", name = "Connector", retryDelay } = config;
  return (parameters) => {
    const { chain, connectors } = parameters;
    const retryCount = config.retryCount ?? parameters.retryCount;
    const request = async ({ method, params }) => {
      const connector2 = connectors == null ? void 0 : connectors.getState().find((c) => c.type === type);
      if (!connector2)
        throw new ProviderDisconnectedError(new Error(`Could not find connector of type "${type}" in \`connectors\` passed to \`createConfig\`.`));
      const provider = await connector2.getProvider({
        chainId: chain == null ? void 0 : chain.id
      });
      if (!provider)
        throw new ProviderDisconnectedError(new Error("Provider is disconnected."));
      const chainId = hexToNumber(await withRetry(() => withTimeout(() => provider.request({ method: "eth_chainId" }), {
        timeout: 100
      })));
      if (chain && chainId !== chain.id)
        throw new ChainDisconnectedError(new Error(`The current chain of the connector (id: ${chainId}) does not match the target chain for the request (id: ${chain.id} – ${chain.name}).`));
      const body = { method, params };
      return provider.request(body);
    };
    return createTransport({
      key,
      name,
      request,
      retryCount,
      retryDelay,
      type: "connector"
    });
  };
}

// node_modules/@wagmi/core/dist/esm/transports/fallback.js
var import_dist58 = __toESM(require_dist(), 1);
var import_dist59 = __toESM(require_dist2(), 1);
var import_dist60 = __toESM(require_dist3(), 1);
function fallback2(transports, config) {
  return fallback(transports, config);
}

// node_modules/@wagmi/core/dist/esm/utils/cookie.js
var import_dist61 = __toESM(require_dist(), 1);
var import_dist62 = __toESM(require_dist2(), 1);
var import_dist63 = __toESM(require_dist3(), 1);
var cookieStorage = {
  getItem(key) {
    if (typeof window === "undefined")
      return null;
    const value = parseCookie(document.cookie, key);
    return value ?? null;
  },
  setItem(key, value) {
    if (typeof window === "undefined")
      return;
    document.cookie = `${key}=${value};path=/;samesite=Lax`;
  },
  removeItem(key) {
    if (typeof window === "undefined")
      return;
    document.cookie = `${key}=;max-age=-1;path=/`;
  }
};
function cookieToInitialState(config, cookie) {
  var _a;
  if (!cookie)
    return void 0;
  const key = `${(_a = config.storage) == null ? void 0 : _a.key}.store`;
  const parsed = parseCookie(cookie, key);
  if (!parsed)
    return void 0;
  return deserialize(parsed).state;
}
function parseCookie(cookie, key) {
  const keyValue = cookie.split("; ").find((x) => x.startsWith(`${key}=`));
  if (!keyValue)
    return void 0;
  return keyValue.substring(key.length + 1);
}

// node_modules/@wagmi/core/dist/esm/utils/normalizeChainId.js
var import_dist64 = __toESM(require_dist(), 1);
var import_dist65 = __toESM(require_dist2(), 1);
var import_dist66 = __toESM(require_dist3(), 1);
function normalizeChainId(chainId) {
  if (typeof chainId === "string")
    return Number.parseInt(chainId, chainId.trim().substring(0, 2) === "0x" ? 16 : 10);
  if (typeof chainId === "bigint")
    return Number(chainId);
  if (typeof chainId === "number")
    return chainId;
  throw new Error(`Cannot normalize chainId "${chainId}" of type "${typeof chainId}"`);
}

// node_modules/@wagmi/core/dist/esm/exports/index.js
var import_dist280 = __toESM(require_dist());
var import_dist281 = __toESM(require_dist2());
var import_dist282 = __toESM(require_dist3());

// node_modules/@wagmi/core/dist/esm/actions/call.js
var import_dist73 = __toESM(require_dist(), 1);
var import_dist74 = __toESM(require_dist2(), 1);
var import_dist75 = __toESM(require_dist3(), 1);

// node_modules/viem/_esm/actions/index.js
var import_dist67 = __toESM(require_dist());
var import_dist68 = __toESM(require_dist2());
var import_dist69 = __toESM(require_dist3());

// node_modules/@wagmi/core/dist/esm/utils/getAction.js
var import_dist70 = __toESM(require_dist(), 1);
var import_dist71 = __toESM(require_dist2(), 1);
var import_dist72 = __toESM(require_dist3(), 1);
function getAction(client, actionFn, name) {
  const action_implicit = client[actionFn.name];
  if (typeof action_implicit === "function")
    return action_implicit;
  const action_explicit = client[name];
  if (typeof action_explicit === "function")
    return action_explicit;
  return (params) => actionFn(client, params);
}

// node_modules/@wagmi/core/dist/esm/actions/call.js
async function call2(config, parameters) {
  const { chainId, ...rest } = parameters;
  const client = config.getClient({ chainId });
  const action = getAction(client, call, "call");
  return action(rest);
}

// node_modules/@wagmi/core/dist/esm/actions/connect.js
var import_dist76 = __toESM(require_dist(), 1);
var import_dist77 = __toESM(require_dist2(), 1);
var import_dist78 = __toESM(require_dist3(), 1);
async function connect(config, parameters) {
  var _a;
  let connector;
  if (typeof parameters.connector === "function") {
    connector = config._internal.connectors.setup(parameters.connector);
  } else
    connector = parameters.connector;
  if (connector.uid === config.state.current)
    throw new ConnectorAlreadyConnectedError();
  try {
    config.setState((x) => ({ ...x, status: "connecting" }));
    connector.emitter.emit("message", { type: "connecting" });
    const { connector: _, ...rest } = parameters;
    const data = await connector.connect(rest);
    const accounts = data.accounts;
    connector.emitter.off("connect", config._internal.events.connect);
    connector.emitter.on("change", config._internal.events.change);
    connector.emitter.on("disconnect", config._internal.events.disconnect);
    await ((_a = config.storage) == null ? void 0 : _a.setItem("recentConnectorId", connector.id));
    config.setState((x) => ({
      ...x,
      connections: new Map(x.connections).set(connector.uid, {
        accounts,
        chainId: data.chainId,
        connector
      }),
      current: connector.uid,
      status: "connected"
    }));
    return { accounts, chainId: data.chainId };
  } catch (error) {
    config.setState((x) => ({
      ...x,
      // Keep existing connector connected in case of error
      status: x.current ? "connected" : "disconnected"
    }));
    throw error;
  }
}

// node_modules/@wagmi/core/dist/esm/actions/deployContract.js
var import_dist82 = __toESM(require_dist(), 1);
var import_dist83 = __toESM(require_dist2(), 1);
var import_dist84 = __toESM(require_dist3(), 1);

// node_modules/@wagmi/core/dist/esm/actions/getConnectorClient.js
var import_dist79 = __toESM(require_dist(), 1);
var import_dist80 = __toESM(require_dist2(), 1);
var import_dist81 = __toESM(require_dist3(), 1);
async function getConnectorClient(config, parameters = {}) {
  let connection;
  if (parameters.connector) {
    const { connector: connector2 } = parameters;
    if (config.state.status === "reconnecting" && !connector2.getAccounts && !connector2.getChainId)
      throw new ConnectorUnavailableReconnectingError({ connector: connector2 });
    const [accounts, chainId2] = await Promise.all([
      connector2.getAccounts().catch((e) => {
        if (parameters.account === null)
          return [];
        throw e;
      }),
      connector2.getChainId()
    ]);
    connection = {
      accounts,
      chainId: chainId2,
      connector: connector2
    };
  } else
    connection = config.state.connections.get(config.state.current);
  if (!connection)
    throw new ConnectorNotConnectedError();
  const chainId = parameters.chainId ?? connection.chainId;
  const connectorChainId = await connection.connector.getChainId();
  if (connectorChainId !== connection.chainId)
    throw new ConnectorChainMismatchError({
      connectionChainId: connection.chainId,
      connectorChainId
    });
  const connector = connection.connector;
  if (connector.getClient)
    return connector.getClient({ chainId });
  const account = parseAccount(parameters.account ?? connection.accounts[0]);
  if (account)
    account.address = getAddress(account.address);
  if (parameters.account && !connection.accounts.some((x) => x.toLowerCase() === account.address.toLowerCase()))
    throw new ConnectorAccountNotFoundError({
      address: account.address,
      connector
    });
  const chain = config.chains.find((chain2) => chain2.id === chainId);
  const provider = await connection.connector.getProvider({ chainId });
  return createClient({
    account,
    chain,
    name: "Connector Client",
    transport: (opts) => custom(provider)({ ...opts, retryCount: 0 })
  });
}

// node_modules/@wagmi/core/dist/esm/actions/deployContract.js
async function deployContract2(config, parameters) {
  const { account, chainId, connector, ...rest } = parameters;
  let client;
  if (typeof account === "object" && (account == null ? void 0 : account.type) === "local")
    client = config.getClient({ chainId });
  else
    client = await getConnectorClient(config, {
      account: account ?? void 0,
      chainId,
      connector
    });
  const action = getAction(client, deployContract, "deployContract");
  const hash = await action({
    ...rest,
    ...account ? { account } : {},
    chain: chainId ? { id: chainId } : null
  });
  return hash;
}

// node_modules/@wagmi/core/dist/esm/actions/disconnect.js
var import_dist85 = __toESM(require_dist(), 1);
var import_dist86 = __toESM(require_dist2(), 1);
var import_dist87 = __toESM(require_dist3(), 1);
async function disconnect(config, parameters = {}) {
  var _a, _b;
  let connector;
  if (parameters.connector)
    connector = parameters.connector;
  else {
    const { connections: connections2, current } = config.state;
    const connection = connections2.get(current);
    connector = connection == null ? void 0 : connection.connector;
  }
  const connections = config.state.connections;
  if (connector) {
    await connector.disconnect();
    connector.emitter.off("change", config._internal.events.change);
    connector.emitter.off("disconnect", config._internal.events.disconnect);
    connector.emitter.on("connect", config._internal.events.connect);
    connections.delete(connector.uid);
  }
  config.setState((x) => {
    if (connections.size === 0)
      return {
        ...x,
        connections: /* @__PURE__ */ new Map(),
        current: null,
        status: "disconnected"
      };
    const nextConnection = connections.values().next().value;
    return {
      ...x,
      connections: new Map(connections),
      current: nextConnection.connector.uid
    };
  });
  {
    const current = config.state.current;
    if (!current)
      return;
    const connector2 = (_a = config.state.connections.get(current)) == null ? void 0 : _a.connector;
    if (!connector2)
      return;
    await ((_b = config.storage) == null ? void 0 : _b.setItem("recentConnectorId", connector2.id));
  }
}

// node_modules/@wagmi/core/dist/esm/actions/estimateGas.js
var import_dist88 = __toESM(require_dist(), 1);
var import_dist89 = __toESM(require_dist2(), 1);
var import_dist90 = __toESM(require_dist3(), 1);
async function estimateGas2(config, parameters) {
  const { chainId, connector, ...rest } = parameters;
  let account;
  if (parameters.account)
    account = parameters.account;
  else {
    const connectorClient = await getConnectorClient(config, {
      account: parameters.account,
      chainId,
      connector
    });
    account = connectorClient.account;
  }
  const client = config.getClient({ chainId });
  const action = getAction(client, estimateGas, "estimateGas");
  return action({ ...rest, account });
}

// node_modules/@wagmi/core/dist/esm/actions/estimateFeesPerGas.js
var import_dist94 = __toESM(require_dist(), 1);
var import_dist95 = __toESM(require_dist2(), 1);
var import_dist96 = __toESM(require_dist3(), 1);

// node_modules/@wagmi/core/dist/esm/utils/getUnit.js
var import_dist91 = __toESM(require_dist(), 1);
var import_dist92 = __toESM(require_dist2(), 1);
var import_dist93 = __toESM(require_dist3(), 1);
function getUnit(unit) {
  if (typeof unit === "number")
    return unit;
  if (unit === "wei")
    return 0;
  return Math.abs(weiUnits[unit]);
}

// node_modules/@wagmi/core/dist/esm/actions/estimateFeesPerGas.js
async function estimateFeesPerGas2(config, parameters = {}) {
  const { chainId, formatUnits: units = "gwei", ...rest } = parameters;
  const client = config.getClient({ chainId });
  const action = getAction(client, estimateFeesPerGas, "estimateFeesPerGas");
  const { gasPrice, maxFeePerGas, maxPriorityFeePerGas } = await action({
    ...rest,
    chain: client.chain
  });
  const unit = getUnit(units);
  const formatted = {
    gasPrice: gasPrice ? formatUnits(gasPrice, unit) : void 0,
    maxFeePerGas: maxFeePerGas ? formatUnits(maxFeePerGas, unit) : void 0,
    maxPriorityFeePerGas: maxPriorityFeePerGas ? formatUnits(maxPriorityFeePerGas, unit) : void 0
  };
  return {
    formatted,
    gasPrice,
    maxFeePerGas,
    maxPriorityFeePerGas
  };
}

// node_modules/@wagmi/core/dist/esm/actions/estimateMaxPriorityFeePerGas.js
var import_dist97 = __toESM(require_dist(), 1);
var import_dist98 = __toESM(require_dist2(), 1);
var import_dist99 = __toESM(require_dist3(), 1);
async function estimateMaxPriorityFeePerGas2(config, parameters = {}) {
  const { chainId } = parameters;
  const client = config.getClient({ chainId });
  const action = getAction(client, estimateMaxPriorityFeePerGas, "estimateMaxPriorityFeePerGas");
  return action({ chain: client.chain });
}

// node_modules/@wagmi/core/dist/esm/actions/getAccount.js
var import_dist100 = __toESM(require_dist(), 1);
var import_dist101 = __toESM(require_dist2(), 1);
var import_dist102 = __toESM(require_dist3(), 1);
function getAccount(config) {
  const uid2 = config.state.current;
  const connection = config.state.connections.get(uid2);
  const addresses = connection == null ? void 0 : connection.accounts;
  const address = addresses == null ? void 0 : addresses[0];
  const chain = config.chains.find((chain2) => chain2.id === (connection == null ? void 0 : connection.chainId));
  const status = config.state.status;
  switch (status) {
    case "connected":
      return {
        address,
        addresses,
        chain,
        chainId: connection == null ? void 0 : connection.chainId,
        connector: connection == null ? void 0 : connection.connector,
        isConnected: true,
        isConnecting: false,
        isDisconnected: false,
        isReconnecting: false,
        status
      };
    case "reconnecting":
      return {
        address,
        addresses,
        chain,
        chainId: connection == null ? void 0 : connection.chainId,
        connector: connection == null ? void 0 : connection.connector,
        isConnected: !!address,
        isConnecting: false,
        isDisconnected: false,
        isReconnecting: true,
        status
      };
    case "connecting":
      return {
        address,
        addresses,
        chain,
        chainId: connection == null ? void 0 : connection.chainId,
        connector: connection == null ? void 0 : connection.connector,
        isConnected: false,
        isConnecting: true,
        isDisconnected: false,
        isReconnecting: false,
        status
      };
    case "disconnected":
      return {
        address: void 0,
        addresses: void 0,
        chain: void 0,
        chainId: void 0,
        connector: void 0,
        isConnected: false,
        isConnecting: false,
        isDisconnected: true,
        isReconnecting: false,
        status
      };
  }
}

// node_modules/@wagmi/core/dist/esm/actions/getBalance.js
var import_dist112 = __toESM(require_dist(), 1);
var import_dist113 = __toESM(require_dist2(), 1);
var import_dist114 = __toESM(require_dist3(), 1);

// node_modules/@wagmi/core/dist/esm/actions/readContracts.js
var import_dist109 = __toESM(require_dist(), 1);
var import_dist110 = __toESM(require_dist2(), 1);
var import_dist111 = __toESM(require_dist3(), 1);

// node_modules/@wagmi/core/dist/esm/actions/multicall.js
var import_dist103 = __toESM(require_dist(), 1);
var import_dist104 = __toESM(require_dist2(), 1);
var import_dist105 = __toESM(require_dist3(), 1);
async function multicall2(config, parameters) {
  const { allowFailure = true, chainId, contracts, ...rest } = parameters;
  const client = config.getClient({ chainId });
  const action = getAction(client, multicall, "multicall");
  return action({
    allowFailure,
    contracts,
    ...rest
  });
}

// node_modules/@wagmi/core/dist/esm/actions/readContract.js
var import_dist106 = __toESM(require_dist(), 1);
var import_dist107 = __toESM(require_dist2(), 1);
var import_dist108 = __toESM(require_dist3(), 1);
function readContract2(config, parameters) {
  const { chainId, ...rest } = parameters;
  const client = config.getClient({ chainId });
  const action = getAction(client, readContract, "readContract");
  return action(rest);
}

// node_modules/@wagmi/core/dist/esm/actions/readContracts.js
async function readContracts(config, parameters) {
  var _a;
  const { allowFailure = true, blockNumber, blockTag, ...rest } = parameters;
  const contracts = parameters.contracts;
  try {
    const contractsByChainId = {};
    for (const [index2, contract] of contracts.entries()) {
      const chainId = contract.chainId ?? config.state.chainId;
      if (!contractsByChainId[chainId])
        contractsByChainId[chainId] = [];
      (_a = contractsByChainId[chainId]) == null ? void 0 : _a.push({ contract, index: index2 });
    }
    const promises = () => Object.entries(contractsByChainId).map(([chainId, contracts2]) => multicall2(config, {
      ...rest,
      allowFailure,
      blockNumber,
      blockTag,
      chainId: Number.parseInt(chainId),
      contracts: contracts2.map(({ contract }) => contract)
    }));
    const multicallResults = (await Promise.all(promises())).flat();
    const resultIndexes = Object.values(contractsByChainId).flatMap((contracts2) => contracts2.map(({ index: index2 }) => index2));
    return multicallResults.reduce((results, result, index2) => {
      if (results)
        results[resultIndexes[index2]] = result;
      return results;
    }, []);
  } catch (error) {
    if (error instanceof ContractFunctionExecutionError)
      throw error;
    const promises = () => contracts.map((contract) => readContract2(config, { ...contract, blockNumber, blockTag }));
    if (allowFailure)
      return (await Promise.allSettled(promises())).map((result) => {
        if (result.status === "fulfilled")
          return { result: result.value, status: "success" };
        return { error: result.reason, result: void 0, status: "failure" };
      });
    return await Promise.all(promises());
  }
}

// node_modules/@wagmi/core/dist/esm/actions/getBalance.js
async function getBalance2(config, parameters) {
  const { address, blockNumber, blockTag, chainId, token: tokenAddress, unit = "ether" } = parameters;
  if (tokenAddress) {
    try {
      return await getTokenBalance(config, {
        balanceAddress: address,
        chainId,
        symbolType: "string",
        tokenAddress
      });
    } catch (error) {
      if (error.name === "ContractFunctionExecutionError") {
        const balance = await getTokenBalance(config, {
          balanceAddress: address,
          chainId,
          symbolType: "bytes32",
          tokenAddress
        });
        const symbol = hexToString(trim(balance.symbol, { dir: "right" }));
        return { ...balance, symbol };
      }
      throw error;
    }
  }
  const client = config.getClient({ chainId });
  const action = getAction(client, getBalance, "getBalance");
  const value = await action(blockNumber ? { address, blockNumber } : { address, blockTag });
  const chain = config.chains.find((x) => x.id === chainId) ?? client.chain;
  return {
    decimals: chain.nativeCurrency.decimals,
    formatted: formatUnits(value, getUnit(unit)),
    symbol: chain.nativeCurrency.symbol,
    value
  };
}
async function getTokenBalance(config, parameters) {
  const { balanceAddress, chainId, symbolType, tokenAddress, unit } = parameters;
  const contract = {
    abi: [
      {
        type: "function",
        name: "balanceOf",
        stateMutability: "view",
        inputs: [{ type: "address" }],
        outputs: [{ type: "uint256" }]
      },
      {
        type: "function",
        name: "decimals",
        stateMutability: "view",
        inputs: [],
        outputs: [{ type: "uint8" }]
      },
      {
        type: "function",
        name: "symbol",
        stateMutability: "view",
        inputs: [],
        outputs: [{ type: symbolType }]
      }
    ],
    address: tokenAddress
  };
  const [value, decimals, symbol] = await readContracts(config, {
    allowFailure: false,
    contracts: [
      {
        ...contract,
        functionName: "balanceOf",
        args: [balanceAddress],
        chainId
      },
      { ...contract, functionName: "decimals", chainId },
      { ...contract, functionName: "symbol", chainId }
    ]
  });
  const formatted = formatUnits(value ?? "0", getUnit(unit ?? decimals));
  return { decimals, formatted, symbol, value };
}

// node_modules/@wagmi/core/dist/esm/actions/getBlock.js
var import_dist115 = __toESM(require_dist(), 1);
var import_dist116 = __toESM(require_dist2(), 1);
var import_dist117 = __toESM(require_dist3(), 1);
async function getBlock2(config, parameters = {}) {
  const { chainId, ...rest } = parameters;
  const client = config.getClient({ chainId });
  const action = getAction(client, getBlock, "getBlock");
  const block = await action(rest);
  return {
    ...block,
    chainId: client.chain.id
  };
}

// node_modules/@wagmi/core/dist/esm/actions/getBlockNumber.js
var import_dist118 = __toESM(require_dist(), 1);
var import_dist119 = __toESM(require_dist2(), 1);
var import_dist120 = __toESM(require_dist3(), 1);
function getBlockNumber2(config, parameters = {}) {
  const { chainId, ...rest } = parameters;
  const client = config.getClient({ chainId });
  const action = getAction(client, getBlockNumber, "getBlockNumber");
  return action(rest);
}

// node_modules/@wagmi/core/dist/esm/actions/getBlockTransactionCount.js
var import_dist121 = __toESM(require_dist(), 1);
var import_dist122 = __toESM(require_dist2(), 1);
var import_dist123 = __toESM(require_dist3(), 1);
function getBlockTransactionCount2(config, parameters = {}) {
  const { chainId, ...rest } = parameters;
  const client = config.getClient({ chainId });
  const action = getAction(client, getBlockTransactionCount, "getBlockTransactionCount");
  return action(rest);
}

// node_modules/@wagmi/core/dist/esm/actions/getBytecode.js
var import_dist124 = __toESM(require_dist(), 1);
var import_dist125 = __toESM(require_dist2(), 1);
var import_dist126 = __toESM(require_dist3(), 1);
async function getBytecode(config, parameters) {
  const { chainId, ...rest } = parameters;
  const client = config.getClient({ chainId });
  const action = getAction(client, getCode, "getBytecode");
  return action(rest);
}

// node_modules/@wagmi/core/dist/esm/actions/getCallsStatus.js
var import_dist127 = __toESM(require_dist(), 1);
var import_dist128 = __toESM(require_dist2(), 1);
var import_dist129 = __toESM(require_dist3(), 1);
async function getCallsStatus2(config, parameters) {
  const { connector, id } = parameters;
  const client = await getConnectorClient(config, { connector });
  return getCallsStatus(client, { id });
}

// node_modules/@wagmi/core/dist/esm/actions/getCapabilities.js
var import_dist130 = __toESM(require_dist(), 1);
var import_dist131 = __toESM(require_dist2(), 1);
var import_dist132 = __toESM(require_dist3(), 1);
async function getCapabilities2(config, parameters = {}) {
  const { account, chainId, connector } = parameters;
  const client = await getConnectorClient(config, { account, connector });
  return getCapabilities(client, {
    account,
    chainId
  });
}

// node_modules/@wagmi/core/dist/esm/actions/getChainId.js
var import_dist133 = __toESM(require_dist(), 1);
var import_dist134 = __toESM(require_dist2(), 1);
var import_dist135 = __toESM(require_dist3(), 1);
function getChainId2(config) {
  return config.state.chainId;
}

// node_modules/@wagmi/core/dist/esm/actions/getChains.js
var import_dist136 = __toESM(require_dist(), 1);
var import_dist137 = __toESM(require_dist2(), 1);
var import_dist138 = __toESM(require_dist3(), 1);
var previousChains = [];
function getChains(config) {
  const chains = config.chains;
  if (deepEqual(previousChains, chains))
    return previousChains;
  previousChains = chains;
  return chains;
}

// node_modules/@wagmi/core/dist/esm/actions/getClient.js
var import_dist139 = __toESM(require_dist(), 1);
var import_dist140 = __toESM(require_dist2(), 1);
var import_dist141 = __toESM(require_dist3(), 1);
function getClient(config, parameters = {}) {
  let client = void 0;
  try {
    client = config.getClient(parameters);
  } catch {
  }
  return client;
}

// node_modules/@wagmi/core/dist/esm/actions/getConnections.js
var import_dist142 = __toESM(require_dist(), 1);
var import_dist143 = __toESM(require_dist2(), 1);
var import_dist144 = __toESM(require_dist3(), 1);
var previousConnections = [];
function getConnections(config) {
  const connections = [...config.state.connections.values()];
  if (config.state.status === "reconnecting")
    return previousConnections;
  if (deepEqual(previousConnections, connections))
    return previousConnections;
  previousConnections = connections;
  return connections;
}

// node_modules/@wagmi/core/dist/esm/actions/getConnectors.js
var import_dist145 = __toESM(require_dist(), 1);
var import_dist146 = __toESM(require_dist2(), 1);
var import_dist147 = __toESM(require_dist3(), 1);
var previousConnectors = [];
function getConnectors(config) {
  const connectors = config.connectors;
  if (deepEqual(previousConnectors, connectors))
    return previousConnectors;
  previousConnectors = connectors;
  return connectors;
}

// node_modules/@wagmi/core/dist/esm/actions/getEnsAddress.js
var import_dist148 = __toESM(require_dist(), 1);
var import_dist149 = __toESM(require_dist2(), 1);
var import_dist150 = __toESM(require_dist3(), 1);
function getEnsAddress2(config, parameters) {
  const { chainId, ...rest } = parameters;
  const client = config.getClient({ chainId });
  const action = getAction(client, getEnsAddress, "getEnsAddress");
  return action(rest);
}

// node_modules/@wagmi/core/dist/esm/actions/getEnsAvatar.js
var import_dist151 = __toESM(require_dist(), 1);
var import_dist152 = __toESM(require_dist2(), 1);
var import_dist153 = __toESM(require_dist3(), 1);
function getEnsAvatar2(config, parameters) {
  const { chainId, ...rest } = parameters;
  const client = config.getClient({ chainId });
  const action = getAction(client, getEnsAvatar, "getEnsAvatar");
  return action(rest);
}

// node_modules/@wagmi/core/dist/esm/actions/getEnsName.js
var import_dist154 = __toESM(require_dist(), 1);
var import_dist155 = __toESM(require_dist2(), 1);
var import_dist156 = __toESM(require_dist3(), 1);
function getEnsName2(config, parameters) {
  const { chainId, ...rest } = parameters;
  const client = config.getClient({ chainId });
  const action = getAction(client, getEnsName, "getEnsName");
  return action(rest);
}

// node_modules/@wagmi/core/dist/esm/actions/getEnsResolver.js
var import_dist157 = __toESM(require_dist(), 1);
var import_dist158 = __toESM(require_dist2(), 1);
var import_dist159 = __toESM(require_dist3(), 1);
function getEnsResolver2(config, parameters) {
  const { chainId, ...rest } = parameters;
  const client = config.getClient({ chainId });
  const action = getAction(client, getEnsResolver, "getEnsResolver");
  return action(rest);
}

// node_modules/@wagmi/core/dist/esm/actions/getEnsText.js
var import_dist160 = __toESM(require_dist(), 1);
var import_dist161 = __toESM(require_dist2(), 1);
var import_dist162 = __toESM(require_dist3(), 1);
function getEnsText2(config, parameters) {
  const { chainId, ...rest } = parameters;
  const client = config.getClient({ chainId });
  const action = getAction(client, getEnsText, "getEnsText");
  return action(rest);
}

// node_modules/@wagmi/core/dist/esm/actions/getFeeHistory.js
var import_dist163 = __toESM(require_dist(), 1);
var import_dist164 = __toESM(require_dist2(), 1);
var import_dist165 = __toESM(require_dist3(), 1);
function getFeeHistory2(config, parameters) {
  const { chainId, ...rest } = parameters;
  const client = config.getClient({ chainId });
  const action = getAction(client, getFeeHistory, "getFeeHistory");
  return action(rest);
}

// node_modules/@wagmi/core/dist/esm/actions/getGasPrice.js
var import_dist166 = __toESM(require_dist(), 1);
var import_dist167 = __toESM(require_dist2(), 1);
var import_dist168 = __toESM(require_dist3(), 1);
function getGasPrice2(config, parameters = {}) {
  const { chainId } = parameters;
  const client = config.getClient({ chainId });
  const action = getAction(client, getGasPrice, "getGasPrice");
  return action({});
}

// node_modules/@wagmi/core/dist/esm/actions/getProof.js
var import_dist169 = __toESM(require_dist(), 1);
var import_dist170 = __toESM(require_dist2(), 1);
var import_dist171 = __toESM(require_dist3(), 1);
async function getProof2(config, parameters) {
  const { chainId, ...rest } = parameters;
  const client = config.getClient({ chainId });
  const action = getAction(client, getProof, "getProof");
  return action(rest);
}

// node_modules/@wagmi/core/dist/esm/actions/getPublicClient.js
var import_dist172 = __toESM(require_dist(), 1);
var import_dist173 = __toESM(require_dist2(), 1);
var import_dist174 = __toESM(require_dist3(), 1);
function getPublicClient(config, parameters = {}) {
  const client = getClient(config, parameters);
  return client == null ? void 0 : client.extend(publicActions);
}

// node_modules/@wagmi/core/dist/esm/actions/getStorageAt.js
var import_dist175 = __toESM(require_dist(), 1);
var import_dist176 = __toESM(require_dist2(), 1);
var import_dist177 = __toESM(require_dist3(), 1);
async function getStorageAt2(config, parameters) {
  const { chainId, ...rest } = parameters;
  const client = config.getClient({ chainId });
  const action = getAction(client, getStorageAt, "getStorageAt");
  return action(rest);
}

// node_modules/@wagmi/core/dist/esm/actions/getToken.js
var import_dist178 = __toESM(require_dist(), 1);
var import_dist179 = __toESM(require_dist2(), 1);
var import_dist180 = __toESM(require_dist3(), 1);
async function getToken(config, parameters) {
  const { address, chainId, formatUnits: unit = 18 } = parameters;
  function getAbi(type) {
    return [
      {
        type: "function",
        name: "decimals",
        stateMutability: "view",
        inputs: [],
        outputs: [{ type: "uint8" }]
      },
      {
        type: "function",
        name: "name",
        stateMutability: "view",
        inputs: [],
        outputs: [{ type }]
      },
      {
        type: "function",
        name: "symbol",
        stateMutability: "view",
        inputs: [],
        outputs: [{ type }]
      },
      {
        type: "function",
        name: "totalSupply",
        stateMutability: "view",
        inputs: [],
        outputs: [{ type: "uint256" }]
      }
    ];
  }
  try {
    const abi = getAbi("string");
    const contractConfig = { address, abi, chainId };
    const [decimals, name, symbol, totalSupply] = await readContracts(config, {
      allowFailure: true,
      contracts: [
        { ...contractConfig, functionName: "decimals" },
        { ...contractConfig, functionName: "name" },
        { ...contractConfig, functionName: "symbol" },
        { ...contractConfig, functionName: "totalSupply" }
      ]
    });
    if (name.error instanceof ContractFunctionExecutionError)
      throw name.error;
    if (symbol.error instanceof ContractFunctionExecutionError)
      throw symbol.error;
    if (decimals.error)
      throw decimals.error;
    if (totalSupply.error)
      throw totalSupply.error;
    return {
      address,
      decimals: decimals.result,
      name: name.result,
      symbol: symbol.result,
      totalSupply: {
        formatted: formatUnits(totalSupply.result, getUnit(unit)),
        value: totalSupply.result
      }
    };
  } catch (error) {
    if (error instanceof ContractFunctionExecutionError) {
      const abi = getAbi("bytes32");
      const contractConfig = { address, abi, chainId };
      const [decimals, name, symbol, totalSupply] = await readContracts(config, {
        allowFailure: false,
        contracts: [
          { ...contractConfig, functionName: "decimals" },
          { ...contractConfig, functionName: "name" },
          { ...contractConfig, functionName: "symbol" },
          { ...contractConfig, functionName: "totalSupply" }
        ]
      });
      return {
        address,
        decimals,
        name: hexToString(trim(name, { dir: "right" })),
        symbol: hexToString(trim(symbol, { dir: "right" })),
        totalSupply: {
          formatted: formatUnits(totalSupply, getUnit(unit)),
          value: totalSupply
        }
      };
    }
    throw error;
  }
}

// node_modules/@wagmi/core/dist/esm/actions/getTransaction.js
var import_dist181 = __toESM(require_dist(), 1);
var import_dist182 = __toESM(require_dist2(), 1);
var import_dist183 = __toESM(require_dist3(), 1);
function getTransaction2(config, parameters) {
  const { chainId, ...rest } = parameters;
  const client = config.getClient({ chainId });
  const action = getAction(client, getTransaction, "getTransaction");
  return action(rest);
}

// node_modules/@wagmi/core/dist/esm/actions/getTransactionConfirmations.js
var import_dist184 = __toESM(require_dist(), 1);
var import_dist185 = __toESM(require_dist2(), 1);
var import_dist186 = __toESM(require_dist3(), 1);
function getTransactionConfirmations2(config, parameters) {
  const { chainId, ...rest } = parameters;
  const client = config.getClient({ chainId });
  const action = getAction(client, getTransactionConfirmations, "getTransactionConfirmations");
  return action(rest);
}

// node_modules/@wagmi/core/dist/esm/actions/getTransactionCount.js
var import_dist187 = __toESM(require_dist(), 1);
var import_dist188 = __toESM(require_dist2(), 1);
var import_dist189 = __toESM(require_dist3(), 1);
async function getTransactionCount2(config, parameters) {
  const { address, blockNumber, blockTag, chainId } = parameters;
  const client = config.getClient({ chainId });
  const action = getAction(client, getTransactionCount, "getTransactionCount");
  return action(blockNumber ? { address, blockNumber } : { address, blockTag });
}

// node_modules/@wagmi/core/dist/esm/actions/getTransactionReceipt.js
var import_dist190 = __toESM(require_dist(), 1);
var import_dist191 = __toESM(require_dist2(), 1);
var import_dist192 = __toESM(require_dist3(), 1);
async function getTransactionReceipt2(config, parameters) {
  const { chainId, ...rest } = parameters;
  const client = config.getClient({ chainId });
  const action = getAction(client, getTransactionReceipt, "getTransactionReceipt");
  return action(rest);
}

// node_modules/@wagmi/core/dist/esm/actions/getWalletClient.js
var import_dist193 = __toESM(require_dist(), 1);
var import_dist194 = __toESM(require_dist2(), 1);
var import_dist195 = __toESM(require_dist3(), 1);
async function getWalletClient(config, parameters = {}) {
  const client = await getConnectorClient(config, parameters);
  return client.extend(walletActions);
}

// node_modules/@wagmi/core/dist/esm/actions/prepareTransactionRequest.js
var import_dist196 = __toESM(require_dist(), 1);
var import_dist197 = __toESM(require_dist2(), 1);
var import_dist198 = __toESM(require_dist3(), 1);
async function prepareTransactionRequest2(config, parameters) {
  const { account: account_, chainId, ...rest } = parameters;
  const account = account_ ?? getAccount(config).address;
  const client = config.getClient({ chainId });
  const action = getAction(client, prepareTransactionRequest, "prepareTransactionRequest");
  return action({
    ...rest,
    ...account ? { account } : {}
  });
}

// node_modules/@wagmi/core/dist/esm/actions/reconnect.js
var import_dist199 = __toESM(require_dist(), 1);
var import_dist200 = __toESM(require_dist2(), 1);
var import_dist201 = __toESM(require_dist3(), 1);
var isReconnecting = false;
async function reconnect(config, parameters = {}) {
  var _a, _b;
  if (isReconnecting)
    return [];
  isReconnecting = true;
  config.setState((x) => ({
    ...x,
    status: x.current ? "reconnecting" : "connecting"
  }));
  const connectors = [];
  if ((_a = parameters.connectors) == null ? void 0 : _a.length) {
    for (const connector_ of parameters.connectors) {
      let connector;
      if (typeof connector_ === "function")
        connector = config._internal.connectors.setup(connector_);
      else
        connector = connector_;
      connectors.push(connector);
    }
  } else
    connectors.push(...config.connectors);
  let recentConnectorId;
  try {
    recentConnectorId = await ((_b = config.storage) == null ? void 0 : _b.getItem("recentConnectorId"));
  } catch {
  }
  const scores = {};
  for (const [, connection] of config.state.connections) {
    scores[connection.connector.id] = 1;
  }
  if (recentConnectorId)
    scores[recentConnectorId] = 0;
  const sorted = Object.keys(scores).length > 0 ? (
    // .toSorted()
    [...connectors].sort((a, b) => (scores[a.id] ?? 10) - (scores[b.id] ?? 10))
  ) : connectors;
  let connected = false;
  const connections = [];
  const providers = [];
  for (const connector of sorted) {
    const provider = await connector.getProvider().catch(() => void 0);
    if (!provider)
      continue;
    if (providers.some((x) => x === provider))
      continue;
    const isAuthorized = await connector.isAuthorized();
    if (!isAuthorized)
      continue;
    const data = await connector.connect({ isReconnecting: true }).catch(() => null);
    if (!data)
      continue;
    connector.emitter.off("connect", config._internal.events.connect);
    connector.emitter.on("change", config._internal.events.change);
    connector.emitter.on("disconnect", config._internal.events.disconnect);
    config.setState((x) => {
      const connections2 = new Map(connected ? x.connections : /* @__PURE__ */ new Map()).set(connector.uid, { accounts: data.accounts, chainId: data.chainId, connector });
      return {
        ...x,
        current: connected ? x.current : connector.uid,
        connections: connections2
      };
    });
    connections.push({
      accounts: data.accounts,
      chainId: data.chainId,
      connector
    });
    providers.push(provider);
    connected = true;
  }
  if (config.state.status === "reconnecting" || config.state.status === "connecting") {
    if (!connected)
      config.setState((x) => ({
        ...x,
        connections: /* @__PURE__ */ new Map(),
        current: null,
        status: "disconnected"
      }));
    else
      config.setState((x) => ({ ...x, status: "connected" }));
  }
  isReconnecting = false;
  return connections;
}

// node_modules/@wagmi/core/dist/esm/actions/sendCalls.js
var import_dist202 = __toESM(require_dist(), 1);
var import_dist203 = __toESM(require_dist2(), 1);
var import_dist204 = __toESM(require_dist3(), 1);
async function sendCalls2(config, parameters) {
  const { account, chainId, connector, calls, ...rest } = parameters;
  const client = await getConnectorClient(config, {
    account,
    chainId,
    connector
  });
  return sendCalls(client, {
    ...rest,
    ...typeof account !== "undefined" ? { account } : {},
    calls,
    chain: chainId ? { id: chainId } : void 0
  });
}

// node_modules/@wagmi/core/dist/esm/actions/sendTransaction.js
var import_dist205 = __toESM(require_dist(), 1);
var import_dist206 = __toESM(require_dist2(), 1);
var import_dist207 = __toESM(require_dist3(), 1);
async function sendTransaction2(config, parameters) {
  const { account, chainId, connector, ...rest } = parameters;
  let client;
  if (typeof account === "object" && (account == null ? void 0 : account.type) === "local")
    client = config.getClient({ chainId });
  else
    client = await getConnectorClient(config, {
      account: account ?? void 0,
      chainId,
      connector
    });
  const action = getAction(client, sendTransaction, "sendTransaction");
  const hash = await action({
    ...rest,
    ...account ? { account } : {},
    chain: chainId ? { id: chainId } : null,
    gas: rest.gas ?? void 0
  });
  return hash;
}

// node_modules/@wagmi/core/dist/esm/actions/showCallsStatus.js
var import_dist208 = __toESM(require_dist(), 1);
var import_dist209 = __toESM(require_dist2(), 1);
var import_dist210 = __toESM(require_dist3(), 1);
async function showCallsStatus2(config, parameters) {
  const { connector, id } = parameters;
  const client = await getConnectorClient(config, { connector });
  return showCallsStatus(client, { id });
}

// node_modules/@wagmi/core/dist/esm/actions/signMessage.js
var import_dist211 = __toESM(require_dist(), 1);
var import_dist212 = __toESM(require_dist2(), 1);
var import_dist213 = __toESM(require_dist3(), 1);
async function signMessage2(config, parameters) {
  const { account, connector, ...rest } = parameters;
  let client;
  if (typeof account === "object" && account.type === "local")
    client = config.getClient();
  else
    client = await getConnectorClient(config, { account, connector });
  const action = getAction(client, signMessage, "signMessage");
  return action({
    ...rest,
    ...account ? { account } : {}
  });
}

// node_modules/@wagmi/core/dist/esm/actions/signTypedData.js
var import_dist214 = __toESM(require_dist(), 1);
var import_dist215 = __toESM(require_dist2(), 1);
var import_dist216 = __toESM(require_dist3(), 1);
async function signTypedData2(config, parameters) {
  const { account, connector, ...rest } = parameters;
  let client;
  if (typeof account === "object" && account.type === "local")
    client = config.getClient();
  else
    client = await getConnectorClient(config, { account, connector });
  const action = getAction(client, signTypedData, "signTypedData");
  return action({
    ...rest,
    ...account ? { account } : {}
  });
}

// node_modules/@wagmi/core/dist/esm/actions/simulateContract.js
var import_dist217 = __toESM(require_dist(), 1);
var import_dist218 = __toESM(require_dist2(), 1);
var import_dist219 = __toESM(require_dist3(), 1);
async function simulateContract2(config, parameters) {
  const { abi, chainId, connector, ...rest } = parameters;
  let account;
  if (parameters.account)
    account = parameters.account;
  else {
    const connectorClient = await getConnectorClient(config, {
      chainId,
      connector
    });
    account = connectorClient.account;
  }
  const client = config.getClient({ chainId });
  const action = getAction(client, simulateContract, "simulateContract");
  const { result, request } = await action({ ...rest, abi, account });
  return {
    chainId: client.chain.id,
    result,
    request: { ...request, chainId }
  };
}

// node_modules/@wagmi/core/dist/esm/actions/switchAccount.js
var import_dist220 = __toESM(require_dist(), 1);
var import_dist221 = __toESM(require_dist2(), 1);
var import_dist222 = __toESM(require_dist3(), 1);
async function switchAccount(config, parameters) {
  var _a;
  const { connector } = parameters;
  const connection = config.state.connections.get(connector.uid);
  if (!connection)
    throw new ConnectorNotConnectedError();
  await ((_a = config.storage) == null ? void 0 : _a.setItem("recentConnectorId", connector.id));
  config.setState((x) => ({
    ...x,
    current: connector.uid
  }));
  return {
    accounts: connection.accounts,
    chainId: connection.chainId
  };
}

// node_modules/@wagmi/core/dist/esm/actions/switchChain.js
var import_dist223 = __toESM(require_dist(), 1);
var import_dist224 = __toESM(require_dist2(), 1);
var import_dist225 = __toESM(require_dist3(), 1);
async function switchChain2(config, parameters) {
  var _a;
  const { addEthereumChainParameter, chainId } = parameters;
  const connection = config.state.connections.get(((_a = parameters.connector) == null ? void 0 : _a.uid) ?? config.state.current);
  if (connection) {
    const connector = connection.connector;
    if (!connector.switchChain)
      throw new SwitchChainNotSupportedError({ connector });
    const chain2 = await connector.switchChain({
      addEthereumChainParameter,
      chainId
    });
    return chain2;
  }
  const chain = config.chains.find((x) => x.id === chainId);
  if (!chain)
    throw new ChainNotConfiguredError();
  config.setState((x) => ({ ...x, chainId }));
  return chain;
}

// node_modules/@wagmi/core/dist/esm/actions/verifyMessage.js
var import_dist226 = __toESM(require_dist(), 1);
var import_dist227 = __toESM(require_dist2(), 1);
var import_dist228 = __toESM(require_dist3(), 1);
async function verifyMessage2(config, parameters) {
  const { chainId, ...rest } = parameters;
  const client = config.getClient({ chainId });
  const action = getAction(client, verifyMessage, "verifyMessage");
  return action(rest);
}

// node_modules/@wagmi/core/dist/esm/actions/verifyTypedData.js
var import_dist229 = __toESM(require_dist(), 1);
var import_dist230 = __toESM(require_dist2(), 1);
var import_dist231 = __toESM(require_dist3(), 1);
async function verifyTypedData2(config, parameters) {
  const { chainId, ...rest } = parameters;
  const client = config.getClient({ chainId });
  const action = getAction(client, verifyTypedData, "verifyTypedData");
  return action(rest);
}

// node_modules/@wagmi/core/dist/esm/actions/waitForCallsStatus.js
var import_dist232 = __toESM(require_dist(), 1);
var import_dist233 = __toESM(require_dist2(), 1);
var import_dist234 = __toESM(require_dist3(), 1);
async function waitForCallsStatus2(config, parameters) {
  const { connector, id } = parameters;
  const client = await getConnectorClient(config, { connector });
  return waitForCallsStatus(client, { id });
}

// node_modules/@wagmi/core/dist/esm/actions/watchAccount.js
var import_dist235 = __toESM(require_dist(), 1);
var import_dist236 = __toESM(require_dist2(), 1);
var import_dist237 = __toESM(require_dist3(), 1);
function watchAccount(config, parameters) {
  const { onChange } = parameters;
  return config.subscribe(() => getAccount(config), onChange, {
    equalityFn(a, b) {
      const { connector: aConnector, ...aRest } = a;
      const { connector: bConnector, ...bRest } = b;
      return deepEqual(aRest, bRest) && // check connector separately
      (aConnector == null ? void 0 : aConnector.id) === (bConnector == null ? void 0 : bConnector.id) && (aConnector == null ? void 0 : aConnector.uid) === (bConnector == null ? void 0 : bConnector.uid);
    }
  });
}

// node_modules/@wagmi/core/dist/esm/actions/watchAsset.js
var import_dist238 = __toESM(require_dist(), 1);
var import_dist239 = __toESM(require_dist2(), 1);
var import_dist240 = __toESM(require_dist3(), 1);
async function watchAsset2(config, parameters) {
  const { connector, ...rest } = parameters;
  const client = await getConnectorClient(config, { connector });
  const action = getAction(client, watchAsset, "watchAsset");
  return action(rest);
}

// node_modules/@wagmi/core/dist/esm/actions/watchBlocks.js
var import_dist241 = __toESM(require_dist(), 1);
var import_dist242 = __toESM(require_dist2(), 1);
var import_dist243 = __toESM(require_dist3(), 1);
function watchBlocks2(config, parameters) {
  const { syncConnectedChain = config._internal.syncConnectedChain, ...rest } = parameters;
  let unwatch;
  const listener = (chainId) => {
    if (unwatch)
      unwatch();
    const client = config.getClient({ chainId });
    const action = getAction(client, watchBlocks, "watchBlocks");
    unwatch = action(rest);
    return unwatch;
  };
  const unlisten = listener(parameters.chainId);
  let unsubscribe;
  if (syncConnectedChain && !parameters.chainId)
    unsubscribe = config.subscribe(({ chainId }) => chainId, async (chainId) => listener(chainId));
  return () => {
    unlisten == null ? void 0 : unlisten();
    unsubscribe == null ? void 0 : unsubscribe();
  };
}

// node_modules/@wagmi/core/dist/esm/actions/watchBlockNumber.js
var import_dist244 = __toESM(require_dist(), 1);
var import_dist245 = __toESM(require_dist2(), 1);
var import_dist246 = __toESM(require_dist3(), 1);
function watchBlockNumber2(config, parameters) {
  const { syncConnectedChain = config._internal.syncConnectedChain, ...rest } = parameters;
  let unwatch;
  const listener = (chainId) => {
    if (unwatch)
      unwatch();
    const client = config.getClient({ chainId });
    const action = getAction(client, watchBlockNumber, "watchBlockNumber");
    unwatch = action(rest);
    return unwatch;
  };
  const unlisten = listener(parameters.chainId);
  let unsubscribe;
  if (syncConnectedChain && !parameters.chainId)
    unsubscribe = config.subscribe(({ chainId }) => chainId, async (chainId) => listener(chainId));
  return () => {
    unlisten == null ? void 0 : unlisten();
    unsubscribe == null ? void 0 : unsubscribe();
  };
}

// node_modules/@wagmi/core/dist/esm/actions/watchChainId.js
var import_dist247 = __toESM(require_dist(), 1);
var import_dist248 = __toESM(require_dist2(), 1);
var import_dist249 = __toESM(require_dist3(), 1);
function watchChainId(config, parameters) {
  const { onChange } = parameters;
  return config.subscribe((state) => state.chainId, onChange);
}

// node_modules/@wagmi/core/dist/esm/actions/watchClient.js
var import_dist250 = __toESM(require_dist(), 1);
var import_dist251 = __toESM(require_dist2(), 1);
var import_dist252 = __toESM(require_dist3(), 1);
function watchClient(config, parameters) {
  const { onChange } = parameters;
  return config.subscribe(() => getClient(config), onChange, {
    equalityFn(a, b) {
      return (a == null ? void 0 : a.uid) === (b == null ? void 0 : b.uid);
    }
  });
}

// node_modules/@wagmi/core/dist/esm/actions/watchConnections.js
var import_dist253 = __toESM(require_dist(), 1);
var import_dist254 = __toESM(require_dist2(), 1);
var import_dist255 = __toESM(require_dist3(), 1);
function watchConnections(config, parameters) {
  const { onChange } = parameters;
  return config.subscribe(() => getConnections(config), onChange, {
    equalityFn: deepEqual
  });
}

// node_modules/@wagmi/core/dist/esm/actions/watchConnectors.js
var import_dist256 = __toESM(require_dist(), 1);
var import_dist257 = __toESM(require_dist2(), 1);
var import_dist258 = __toESM(require_dist3(), 1);
function watchConnectors(config, parameters) {
  const { onChange } = parameters;
  return config._internal.connectors.subscribe((connectors, prevConnectors) => {
    onChange(Object.values(connectors), prevConnectors);
  });
}

// node_modules/@wagmi/core/dist/esm/actions/watchContractEvent.js
var import_dist259 = __toESM(require_dist(), 1);
var import_dist260 = __toESM(require_dist2(), 1);
var import_dist261 = __toESM(require_dist3(), 1);
function watchContractEvent2(config, parameters) {
  const { syncConnectedChain = config._internal.syncConnectedChain, ...rest } = parameters;
  let unwatch;
  const listener = (chainId) => {
    if (unwatch)
      unwatch();
    const client = config.getClient({ chainId });
    const action = getAction(client, watchContractEvent, "watchContractEvent");
    unwatch = action(rest);
    return unwatch;
  };
  const unlisten = listener(parameters.chainId);
  let unsubscribe;
  if (syncConnectedChain && !parameters.chainId)
    unsubscribe = config.subscribe(({ chainId }) => chainId, async (chainId) => listener(chainId));
  return () => {
    unlisten == null ? void 0 : unlisten();
    unsubscribe == null ? void 0 : unsubscribe();
  };
}

// node_modules/@wagmi/core/dist/esm/actions/watchPendingTransactions.js
var import_dist262 = __toESM(require_dist(), 1);
var import_dist263 = __toESM(require_dist2(), 1);
var import_dist264 = __toESM(require_dist3(), 1);
function watchPendingTransactions2(config, parameters) {
  const { syncConnectedChain = config._internal.syncConnectedChain, ...rest } = parameters;
  let unwatch;
  const listener = (chainId) => {
    if (unwatch)
      unwatch();
    const client = config.getClient({ chainId });
    const action = getAction(client, watchPendingTransactions, "watchPendingTransactions");
    unwatch = action(rest);
    return unwatch;
  };
  const unlisten = listener(parameters.chainId);
  let unsubscribe;
  if (syncConnectedChain && !parameters.chainId)
    unsubscribe = config.subscribe(({ chainId }) => chainId, async (chainId) => listener(chainId));
  return () => {
    unlisten == null ? void 0 : unlisten();
    unsubscribe == null ? void 0 : unsubscribe();
  };
}

// node_modules/@wagmi/core/dist/esm/actions/watchPublicClient.js
var import_dist265 = __toESM(require_dist(), 1);
var import_dist266 = __toESM(require_dist2(), 1);
var import_dist267 = __toESM(require_dist3(), 1);
function watchPublicClient(config, parameters) {
  const { onChange } = parameters;
  return config.subscribe(() => getPublicClient(config), onChange, {
    equalityFn(a, b) {
      return (a == null ? void 0 : a.uid) === (b == null ? void 0 : b.uid);
    }
  });
}

// node_modules/@wagmi/core/dist/esm/actions/waitForTransactionReceipt.js
var import_dist268 = __toESM(require_dist(), 1);
var import_dist269 = __toESM(require_dist2(), 1);
var import_dist270 = __toESM(require_dist3(), 1);
async function waitForTransactionReceipt2(config, parameters) {
  const { chainId, timeout = 0, ...rest } = parameters;
  const client = config.getClient({ chainId });
  const action = getAction(client, waitForTransactionReceipt, "waitForTransactionReceipt");
  const receipt = await action({ ...rest, timeout });
  if (receipt.status === "reverted") {
    const action_getTransaction = getAction(client, getTransaction, "getTransaction");
    const txn = await action_getTransaction({ hash: receipt.transactionHash });
    const action_call = getAction(client, call, "call");
    const code = await action_call({
      ...txn,
      data: txn.input,
      gasPrice: txn.type !== "eip1559" ? txn.gasPrice : void 0,
      maxFeePerGas: txn.type === "eip1559" ? txn.maxFeePerGas : void 0,
      maxPriorityFeePerGas: txn.type === "eip1559" ? txn.maxPriorityFeePerGas : void 0
    });
    const reason = (code == null ? void 0 : code.data) ? hexToString(`0x${code.data.substring(138)}`) : "unknown reason";
    throw new Error(reason);
  }
  return {
    ...receipt,
    chainId: client.chain.id
  };
}

// node_modules/@wagmi/core/dist/esm/actions/writeContract.js
var import_dist271 = __toESM(require_dist(), 1);
var import_dist272 = __toESM(require_dist2(), 1);
var import_dist273 = __toESM(require_dist3(), 1);
async function writeContract2(config, parameters) {
  const { account, chainId, connector, ...request } = parameters;
  let client;
  if (typeof account === "object" && (account == null ? void 0 : account.type) === "local")
    client = config.getClient({ chainId });
  else
    client = await getConnectorClient(config, {
      account: account ?? void 0,
      chainId,
      connector
    });
  const action = getAction(client, writeContract, "writeContract");
  const hash = await action({
    ...request,
    ...account ? { account } : {},
    chain: chainId ? { id: chainId } : null
  });
  return hash;
}

// node_modules/@wagmi/core/dist/esm/hydrate.js
var import_dist274 = __toESM(require_dist(), 1);
var import_dist275 = __toESM(require_dist2(), 1);
var import_dist276 = __toESM(require_dist3(), 1);
function hydrate(config, parameters) {
  const { initialState, reconnectOnMount } = parameters;
  if (initialState && !config._internal.store.persist.hasHydrated())
    config.setState({
      ...initialState,
      chainId: config.chains.some((x) => x.id === initialState.chainId) ? initialState.chainId : config.chains[0].id,
      connections: reconnectOnMount ? initialState.connections : /* @__PURE__ */ new Map(),
      status: reconnectOnMount ? "reconnecting" : "disconnected"
    });
  return {
    async onMount() {
      if (config._internal.ssr) {
        await config._internal.store.persist.rehydrate();
        if (config._internal.mipd) {
          config._internal.connectors.setState((connectors) => {
            var _a;
            const rdnsSet = /* @__PURE__ */ new Set();
            for (const connector of connectors ?? []) {
              if (connector.rdns) {
                const rdnsValues = Array.isArray(connector.rdns) ? connector.rdns : [connector.rdns];
                for (const rdns of rdnsValues) {
                  rdnsSet.add(rdns);
                }
              }
            }
            const mipdConnectors = [];
            const providers = ((_a = config._internal.mipd) == null ? void 0 : _a.getProviders()) ?? [];
            for (const provider of providers) {
              if (rdnsSet.has(provider.info.rdns))
                continue;
              const connectorFn = config._internal.connectors.providerDetailToConnector(provider);
              const connector = config._internal.connectors.setup(connectorFn);
              mipdConnectors.push(connector);
            }
            return [...connectors, ...mipdConnectors];
          });
        }
      }
      if (reconnectOnMount)
        reconnect(config);
      else if (config.storage)
        config.setState((x) => ({
          ...x,
          connections: /* @__PURE__ */ new Map()
        }));
    }
  };
}

// node_modules/@wagmi/core/dist/esm/utils/extractRpcUrls.js
var import_dist277 = __toESM(require_dist(), 1);
var import_dist278 = __toESM(require_dist2(), 1);
var import_dist279 = __toESM(require_dist3(), 1);
function extractRpcUrls(parameters) {
  var _a, _b, _c;
  const { chain } = parameters;
  const fallbackUrl = chain.rpcUrls.default.http[0];
  if (!parameters.transports)
    return [fallbackUrl];
  const transport = (_b = (_a = parameters.transports) == null ? void 0 : _a[chain.id]) == null ? void 0 : _b.call(_a, { chain });
  const transports = ((_c = transport == null ? void 0 : transport.value) == null ? void 0 : _c.transports) || [transport];
  return transports.map(({ value }) => (value == null ? void 0 : value.url) || fallbackUrl);
}

export {
  call2 as call,
  BaseError,
  ChainNotConfiguredError,
  ConnectorAlreadyConnectedError,
  ConnectorNotConnectedError,
  ConnectorNotFoundError,
  ConnectorAccountNotFoundError,
  ConnectorChainMismatchError,
  ConnectorUnavailableReconnectingError,
  connect,
  getConnectorClient,
  deployContract2 as deployContract,
  disconnect,
  estimateGas2 as estimateGas,
  estimateFeesPerGas2 as estimateFeesPerGas,
  estimateMaxPriorityFeePerGas2 as estimateMaxPriorityFeePerGas,
  getAccount,
  readContract2 as readContract,
  readContracts,
  getBalance2 as getBalance,
  getBlock2 as getBlock,
  getBlockNumber2 as getBlockNumber,
  getBlockTransactionCount2 as getBlockTransactionCount,
  getBytecode,
  getCallsStatus2 as getCallsStatus,
  getCapabilities2 as getCapabilities,
  getChainId2 as getChainId,
  deepEqual,
  getChains,
  getClient,
  getConnections,
  getConnectors,
  getEnsAddress2 as getEnsAddress,
  getEnsAvatar2 as getEnsAvatar,
  getEnsName2 as getEnsName,
  getEnsResolver2 as getEnsResolver,
  getEnsText2 as getEnsText,
  getFeeHistory2 as getFeeHistory,
  getGasPrice2 as getGasPrice,
  getProof2 as getProof,
  getPublicClient,
  getStorageAt2 as getStorageAt,
  getToken,
  getTransaction2 as getTransaction,
  getTransactionConfirmations2 as getTransactionConfirmations,
  getTransactionCount2 as getTransactionCount,
  getTransactionReceipt2 as getTransactionReceipt,
  getWalletClient,
  prepareTransactionRequest2 as prepareTransactionRequest,
  reconnect,
  sendCalls2 as sendCalls,
  sendTransaction2 as sendTransaction,
  showCallsStatus2 as showCallsStatus,
  signMessage2 as signMessage,
  signTypedData2 as signTypedData,
  simulateContract2 as simulateContract,
  switchAccount,
  ProviderNotFoundError,
  SwitchChainNotSupportedError,
  switchChain2 as switchChain,
  verifyMessage2 as verifyMessage,
  verifyTypedData2 as verifyTypedData,
  waitForCallsStatus2 as waitForCallsStatus,
  watchAccount,
  watchAsset2 as watchAsset,
  watchBlocks2 as watchBlocks,
  watchBlockNumber2 as watchBlockNumber,
  watchChainId,
  watchClient,
  watchConnections,
  watchConnectors,
  watchContractEvent2 as watchContractEvent,
  watchPendingTransactions2 as watchPendingTransactions,
  watchPublicClient,
  waitForTransactionReceipt2 as waitForTransactionReceipt,
  writeContract2 as writeContract,
  createConnector,
  injected,
  mock,
  deserialize,
  serialize,
  createStorage,
  noopStorage,
  createConfig,
  hydrate,
  unstable_connector,
  fallback2 as fallback,
  cookieStorage,
  cookieToInitialState,
  parseCookie,
  extractRpcUrls,
  normalizeChainId
};
//# sourceMappingURL=chunk-WQNN3YP6.js.map
