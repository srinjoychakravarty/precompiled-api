"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _types = require("@polkadot/types");

var _util = require("@polkadot/util");

var _MetaRegistry = _interopRequireDefault(require("./MetaRegistry"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// parse a selector, this can be a number (older) or of [<hex>, <hex>, ...]. However,
// just catch everything (since this is now non-standard for u32 anyway)
function parseSelector(registry, fnname, input) {
  if ((0, _util.isNumber)(input)) {
    return registry.createType('u32', input);
  } else if ((0, _util.isHex)(input)) {
    return registry.createType('u32', (0, _util.hexToU8a)(input));
  } else if (typeof input === 'string') {
    try {
      const array = JSON.parse(input);
      (0, _util.assert)(array.length === 4, `${fnname}: Invalid selector length`);
      return registry.createType('u32', Uint8Array.from( // the as number[] is here to pacify TS, it doesn't quite know how to handle the cb
      array.map(value => (0, _util.isHex)(value) ? (0, _util.hexToNumber)(value.toString()) : value)));
    } catch (e) {
      console.error(e);
    }
  }

  throw new Error(`${fnname}: Unable to parse selector`);
}

function createArgClass(registry, args, baseDef) {
  return (0, _types.createClass)(registry, JSON.stringify(args.reduce((base, {
    name,
    type
  }) => {
    base[name] = type.displayName || (0, _types.encodeType)(type);
    return base;
  }, baseDef)));
}

class ContractRegistry extends _MetaRegistry.default {
  // Contract ABI helpers
  validateArgs(name, args) {
    (0, _util.assert)(Array.isArray(args), `Expected 'args' to exist on ${name}`);
    args.forEach(arg => {
      const unknownKeys = Object.keys(arg).filter(key => !['name', 'type'].includes(key));
      (0, _util.assert)(unknownKeys.length === 0, `Unknown keys ${unknownKeys.join(', ')} found in ABI args for ${name}`);
      (0, _util.assert)((0, _util.isNumber)(arg.name) && (0, _util.isString)(this._stringAt(arg.name)), `${name} args should have valid name `);
      (0, _util.assert)((0, _util.isNumber)(arg.type.ty) && (0, _util.isObject)(this.typeDefAt(arg.type.ty)), `${name} args should have valid type`);
    });
  }

  validateConstructors({
    contract: {
      constructors
    }
  }) {
    constructors.forEach((constructor, index) => {
      const unknownKeys = Object.keys(constructor).filter(key => !['args', 'docs', 'name', 'selector'].includes(key));
      (0, _util.assert)(unknownKeys.length === 0, `Unknown keys ${unknownKeys.join(', ')} found in ABI constructor`);
      this.validateArgs(`constructor ${index}`, constructor.args);
    });
  }

  validateMessages({
    contract: {
      messages
    }
  }) {
    messages.forEach(message => {
      const unknownKeys = Object.keys(message).filter(key => !['args', 'docs', 'mutates', 'name', 'selector', 'return_type'].includes(key));
      const fnname = `messages.${message.name}`;
      (0, _util.assert)(unknownKeys.length === 0, `Unknown keys ${unknownKeys.join(', ')} found in ABI args for messages.${message.name}`);
      const {
        name,
        return_type: returnType,
        selector
      } = message;
      (0, _util.assert)((0, _util.isNumber)(name) && (0, _util.isString)(this._stringAt(name)), `Expected name for ${fnname}`);
      (0, _util.assert)((0, _util.isNull)(returnType) || (0, _util.isNumber)(returnType.ty) && (0, _util.isObject)(this.typeDefAt(returnType.ty)), `Expected return_type for ${fnname}`);
      parseSelector(this.registry, fnname, selector);
      this.validateArgs(fnname, message.args);
    });
  }

  validateAbi(abi) {
    const unknownKeys = Object.keys(abi.contract).filter(key => !['constructors', 'docs', 'events', 'messages', 'name'].includes(key));
    (0, _util.assert)(unknownKeys.length === 0, `Unknown fields ${unknownKeys.join(', ')} found in ABI`);
    const {
      contract: {
        constructors,
        messages,
        name
      }
    } = abi;
    (0, _util.assert)(constructors && messages && (0, _util.isString)(this._stringAt(name)), 'ABI should have constructors, messages & name sections');
    this.validateConstructors(abi);
    this.validateMessages(abi);
  }

  createMessage(name, message) {
    const args = message.args.map(({
      name,
      type
    }) => {
      (0, _util.assert)((0, _util.isObject)(type), `Invalid type at index ${type.toString()}`);
      return {
        name: (0, _util.stringCamelCase)(name),
        type
      };
    });
    const Clazz = createArgClass(this.registry, args, (0, _util.isUndefined)(message.selector) ? {} : {
      __selector: 'u32'
    });
    const baseStruct = {
      __selector: (0, _util.isUndefined)(message.selector) ? undefined : parseSelector(this.registry, name, message.selector)
    };

    const encoder = (...params) => {
      (0, _util.assert)(params.length === args.length, `Expected ${args.length} arguments to contract ${name}, found ${params.length}`);
      const u8a = new Clazz(this.registry, args.reduce((mapped, {
        name
      }, index) => {
        mapped[name] = params[index];
        return mapped;
      }, _objectSpread({}, baseStruct))).toU8a();
      return _types.Compact.addLengthPrefix(u8a);
    };

    const fn = encoder;
    fn.args = args;
    fn.isConstant = !(message.mutates || false);
    fn.type = message.returnType || null;
    return fn;
  }

  convertAbi({
    contract,
    storage
  }) {
    return {
      contract: this.convertContract(contract),
      storage: this.convertStorage(storage)
    };
  }

  convertArgs(args) {
    return args.map((_ref) => {
      let {
        name,
        type
      } = _ref,
          arg = (0, _objectWithoutProperties2.default)(_ref, ["name", "type"]);
      return _objectSpread(_objectSpread({}, arg), {}, {
        name: this._stringAt(name),
        type: this.convertType(type)
      });
    });
  }

  convertType({
    display_name: displayNameIndices,
    ty
  }) {
    const displayName = this.stringsAt(displayNameIndices).join('::');
    return this.typeDefAt(ty, {
      displayName
    });
  }

  convertContract(_ref2) {
    let {
      constructors,
      events,
      messages,
      name
    } = _ref2,
        contract = (0, _objectWithoutProperties2.default)(_ref2, ["constructors", "events", "messages", "name"]);
    return _objectSpread(_objectSpread({
      constructors: this.convertConstructors(constructors),
      messages: messages.map(message => this.convertMessage(message)),
      name: this._stringAt(name)
    }, events ? {
      events: events.map(event => this.convertEvent(event))
    } : {}), contract);
  }

  convertConstructors(constructors) {
    return constructors.map(constructor => {
      return this.convertMessage(constructor);
    });
  }

  convertMessage(_ref3) {
    let {
      args,
      name,
      return_type: returnType
    } = _ref3,
        message = (0, _objectWithoutProperties2.default)(_ref3, ["args", "name", "return_type"]);
    return _objectSpread(_objectSpread({}, message), {}, {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      args: this.convertArgs(args),
      name: this._stringAt(name),
      returnType: returnType ? this.convertType(returnType) : null
    });
  }

  convertEvent({
    args
  }) {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      args: this.convertArgs(args)
    };
  }

  convertStorage(storage) {
    return this.convertStorageStruct(storage);
  }

  convertStorageLayout(storageLayout) {
    if (storageLayout['struct.type']) {
      return this.convertStorageStruct(storageLayout);
    } else {
      return this.convertStorageRange(storageLayout);
    }
  }

  convertStorageStruct({
    'struct.fields': structFields,
    'struct.type': structType
  }) {
    return {
      'struct.fields': structFields.map(({
        layout,
        name
      }) => ({
        layout: this.convertStorageLayout(layout),
        name: this._stringAt(name)
      })),
      'struct.type': this.typeDefAt(structType)
    };
  }

  convertStorageRange(_ref4) {
    let {
      'range.elem_type': type
    } = _ref4,
        range = (0, _objectWithoutProperties2.default)(_ref4, ["range.elem_type"]);
    return _objectSpread(_objectSpread({}, range), {}, {
      'range.elem_type': this.typeDefAt(type)
    });
  }

}

exports.default = ContractRegistry;