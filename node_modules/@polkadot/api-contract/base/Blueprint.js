"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _operators = require("rxjs/operators");

var _api = require("@polkadot/api");

var _util = require("@polkadot/util");

var _Contract = _interopRequireDefault(require("./Contract"));

var _util2 = require("./util");

// Copyright 2017-2020 @polkadot/api-contract authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
class BlueprintCreateResult extends _api.SubmittableResult {
  constructor(result, contract) {
    super(result);
    this.contract = void 0;
    this.contract = contract;
  }

} // NOTE Experimental, POC, bound to change


class Blueprint extends _util2.BaseWithTx {
  constructor(api, abi, decorateMethod, codeHash) {
    super(api, abi, decorateMethod);
    this.codeHash = void 0;

    this._createResult = result => {
      let contract;

      if (result.isInBlock) {
        const record = result.findRecord('contract', 'Instantiated');

        if (record) {
          contract = new _Contract.default(this.api, this.abi, this.decorateMethod, record.event.data[1]);
        }
      }

      return new BlueprintCreateResult(result, contract);
    };

    this.codeHash = this.registry.createType('Hash', codeHash);
  }

  deployContract(constructorIndex = 0, endowment, maxGas, ...params) {
    (0, _util.assert)(!!this.abi.constructors[constructorIndex], `Specified constructor index ${constructorIndex} does not exist`);
    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      signAndSend: this.decorateMethod(account => {
        return this._apiContracts.create(endowment, maxGas, this.codeHash, this.abi.constructors[constructorIndex](...params)).signAndSend(account).pipe((0, _operators.map)(this._createResult));
      })
    };
  }

}

exports.default = Blueprint;