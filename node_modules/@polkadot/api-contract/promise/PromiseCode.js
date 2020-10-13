"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _promise = require("@polkadot/api/promise");

var _Code = _interopRequireDefault(require("../base/Code"));

// Copyright 2017-2020 @polkadot/api-contract authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
class PromiseCode extends _Code.default {
  constructor(api, abi, wasm) {
    super(api, abi, _promise.decorateMethod, wasm);
  }

}

exports.default = PromiseCode;