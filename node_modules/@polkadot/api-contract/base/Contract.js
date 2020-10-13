"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _operators = require("rxjs/operators");

var _util = require("../util");

var _util2 = require("./util");

// Copyright 2017-2020 @polkadot/api-contract authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
class Contract extends _util2.BaseWithTxAndRpcCall {
  constructor(api, abi, decorateMethod, address) {
    super(api, abi, decorateMethod);
    this.address = void 0;
    this.address = this.registry.createType('Address', address);
  }

  call(as, message, value, gasLimit, ...params) {
    const {
      def,
      fn
    } = this.getMessage(message);
    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      send: this.decorateMethod(as === 'rpc' && this.hasRpcContractsCall ? account => this._rpcContractsCall(this.registry.createType('ContractCallRequest', {
        dest: this.address.toString(),
        gasLimit,
        inputData: fn(...params),
        origin: account,
        value
      })).pipe((0, _operators.map)(result => this._createOutcome(result, this.registry.createType('AccountId', account), def, params))) : account => this._apiContracts.call(this.address, value, gasLimit, fn(...params)).signAndSend(account))
    };
  }

  _createOutcome(result, origin, message, params) {
    let output = null;

    if (result.isSuccess) {
      const {
        data
      } = result.asSuccess;
      output = message.returnType ? (0, _util.formatData)(this.registry, data, message.returnType) : this.registry.createType('Raw', data);
    }

    return {
      isSuccess: result.isSuccess,
      message,
      origin,
      output,
      params,
      result,
      time: Date.now()
    };
  }

}

exports.default = Contract;