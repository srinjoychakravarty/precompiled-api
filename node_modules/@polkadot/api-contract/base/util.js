"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BaseWithTxAndRpcCall = exports.BaseWithTx = exports.Base = void 0;

var _util = require("@polkadot/util");

var _Abi = _interopRequireDefault(require("../Abi"));

// Copyright 2017-2020 @polkadot/api authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
class Base {
  constructor(api, abi, decorateMethod) {
    this.abi = void 0;
    this.api = void 0;
    this.decorateMethod = void 0;
    this.registry = void 0;
    this.abi = abi instanceof _Abi.default ? abi : new _Abi.default(api.registry, abi);
    this.registry = api.registry;
    this.api = api;
    this.decorateMethod = decorateMethod;
  }

  get messages() {
    return this.abi.abi.contract.messages.map((def, index) => ({
      def,
      fn: this.abi.messages[def.name] || this.abi.messages[(0, _util.stringCamelCase)(name)],
      index
    }));
  }

  getMessage(nameOrIndex) {
    const index = nameOrIndex ? typeof nameOrIndex === 'number' ? nameOrIndex : this.abi.abi.contract.messages.findIndex(message => nameOrIndex === message.name || nameOrIndex === (0, _util.stringCamelCase)(message.name)) : 0;
    const def = this.abi.abi.contract.messages[index];
    (0, _util.assert)(!!def, `Attempted to access a contract message that does not exist: ${typeof nameOrIndex === 'number' ? `index ${nameOrIndex}` : nameOrIndex || 'unknown'}`);
    const fn = this.abi.messages[def.name] || this.abi.messages[(0, _util.stringCamelCase)(def.name)];
    return {
      def,
      fn,
      index
    };
  }

}

exports.Base = Base;

class BaseWithTx extends Base {
  get _apiContracts() {
    return this.api.rx.tx.contracts;
  }

  constructor(api, abi, decorateMethod) {
    super(api, abi, decorateMethod);
    (0, _util.assert)(this.api.rx.tx.contracts && this.api.rx.tx.contracts.putCode, 'You need to connect to a node with the contracts module, the metadata does not enable api.tx.contracts on this instance');
  }

}

exports.BaseWithTx = BaseWithTx;

class BaseWithTxAndRpcCall extends BaseWithTx {
  get hasRpcContractsCall() {
    var _this$api$rx$rpc$cont;

    return (0, _util.isFunction)((_this$api$rx$rpc$cont = this.api.rx.rpc.contracts) === null || _this$api$rx$rpc$cont === void 0 ? void 0 : _this$api$rx$rpc$cont.call);
  }

  get _rpcContractsCall() {
    (0, _util.assert)(this.hasRpcContractsCall, 'You need to connect to a node with the contracts.call RPC method.');
    return this.api.rx.rpc.contracts.call;
  }

}

exports.BaseWithTxAndRpcCall = BaseWithTxAndRpcCall;