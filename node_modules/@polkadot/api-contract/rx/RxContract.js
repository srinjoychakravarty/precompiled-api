"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _rx = require("@polkadot/api/rx");

var _Contract = _interopRequireDefault(require("../base/Contract"));

// Copyright 2017-2020 @polkadot/api-contract authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
class RxContract extends _Contract.default {
  constructor(api, abi, address) {
    super(api, abi, _rx.decorateMethod, address);
  }

}

exports.default = RxContract;