"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatData = formatData;

var _types = require("@polkadot/types/types");

var _types2 = require("@polkadot/types");

// Copyright 2017-2020 @polkadot/rpc-core authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
function formatData(registry, data, {
  info,
  type
}) {
  if (info === _types.TypeDefInfo.Option) {
    return new _types2.Option(registry, (0, _types2.createClass)(registry, type), (0, _types2.createTypeUnsafe)(registry, type, [data], true));
  }

  return (0, _types2.createTypeUnsafe)(registry, type, [data], true);
}