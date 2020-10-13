"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _operators = require("rxjs/operators");

var _api = require("@polkadot/api");

var _util = require("@polkadot/util");

var _Blueprint = _interopRequireDefault(require("./Blueprint"));

var _util2 = require("./util");

// Copyright 2017-2020 @polkadot/api-contract authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
class CodePutCodeResult extends _api.SubmittableResult {
  constructor(result, blueprint) {
    super(result);
    this.blueprint = void 0;
    this.blueprint = blueprint;
  }

} // NOTE Experimental, POC, bound to change


class Code extends _util2.BaseWithTx {
  constructor(api, abi, decorateMethod, wasm) {
    super(api, abi, decorateMethod);
    this.code = void 0;

    this.createBlueprint = maxGas => {
      return {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        signAndSend: this.decorateMethod(account => this._apiContracts.putCode(maxGas, (0, _util.compactAddLength)(this.code)).signAndSend(account).pipe((0, _operators.map)(this._createResult)))
      };
    };

    this._createResult = result => {
      let blueprint;

      if (result.isInBlock) {
        const record = result.findRecord('contract', 'CodeStored');

        if (record) {
          blueprint = new _Blueprint.default(this.api, this.abi, this.decorateMethod, record.event.data[0]);
        }
      }

      return new CodePutCodeResult(result, blueprint);
    };

    this.code = (0, _util.u8aToU8a)(wasm);
  }

}

exports.default = Code;