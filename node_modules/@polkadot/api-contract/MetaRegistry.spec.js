"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _types = require("@polkadot/types");

var _MetaRegistry = _interopRequireDefault(require("./MetaRegistry"));

var _Erc = _interopRequireDefault(require("../test/contracts/Erc20.json"));

var _erc20Test = _interopRequireDefault(require("../test/compare/erc20.test.json"));

var _SharedVecV = _interopRequireDefault(require("../test/contracts/SharedVecV2.json"));

var _sharedVecTest = _interopRequireDefault(require("../test/compare/shared-vec.test.json"));

var _test = _interopRequireDefault(require("../test/abi/test001.json"));

var _test001Cmp = _interopRequireDefault(require("../test/compare/test001.cmp.json"));

// Copyright 2017-2020 @polkadot/types authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
function compare(meta, other) {
  try {
    expect(meta.typeDefs).toEqual(other);
  } catch (error) {
    console.error(JSON.stringify(meta.typeDefs));
    throw error;
  }
}

describe('MetaRegistry', () => {
  const registry = new _types.TypeRegistry();
  describe('construction', () => {
    it('initializes from a contract ABI (ERC20)', () => {
      compare(new _MetaRegistry.default(registry, _Erc.default), _erc20Test.default);
    });
    it('initializes from a contract ABI (SharedVec)', () => {
      compare(new _MetaRegistry.default(registry, _SharedVecV.default), _sharedVecTest.default);
    });
    it('initializes from a contract ABI (Other, test001)', () => {
      compare(new _MetaRegistry.default(registry, _test.default), _test001Cmp.default);
    });
  });
});