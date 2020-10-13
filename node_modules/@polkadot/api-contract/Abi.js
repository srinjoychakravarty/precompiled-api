"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _util = require("@polkadot/util");

var _ContractRegistry = _interopRequireDefault(require("./ContractRegistry"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

class ContractAbi extends _ContractRegistry.default {
  constructor(registry, abi) {
    super(registry, abi);
    this.abi = void 0;
    this.constructors = void 0;
    this.messages = void 0;
    [this.abi, this.constructors, this.messages] = this._decodeAbi(abi);
  }

  _decodeAbi(abiPre) {
    this.validateAbi(abiPre);
    const abi = this.convertAbi(abiPre);
    const constructors = abi.contract.constructors.map((constructor, index) => {
      return this.createMessage(`constructor ${index}`, constructor);
    });
    const messages = abi.contract.messages.reduce((result, message) => {
      const name = (0, _util.stringCamelCase)(message.name);
      return _objectSpread(_objectSpread({}, result), {}, {
        [name]: this.createMessage(`messages.${name}`, message)
      });
    }, {});
    return [abi, constructors, messages];
  }

}

exports.default = ContractAbi;