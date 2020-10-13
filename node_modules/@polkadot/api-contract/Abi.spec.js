"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _types = require("@polkadot/types");

var _incrementer = _interopRequireDefault(require("../test/contracts/incrementer.json"));

var _ = require(".");

// Copyright 2017-2020 @polkadot/api-contract authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
describe('Abi', () => {
  const registry = new _types.TypeRegistry();
  describe('incrementer', () => {
    let abi;
    beforeEach(() => {
      abi = new _.Abi(registry, _incrementer.default);
    });
    it('has the attached methods', () => {
      expect(Object.values(abi.abi.contract.messages).map(({
        name
      }) => name)).toEqual(['inc', 'get', 'compare']);
    });
  });
});