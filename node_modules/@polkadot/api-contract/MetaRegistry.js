"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _types = require("@polkadot/types/types");

var _util = require("@polkadot/util");

var _types2 = require("@polkadot/types");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

const builtinMap = [[id => typeof id === 'string', _types.MetaTypeInfo.BuiltinPlain], [id => Array.isArray(id), _types.MetaTypeInfo.BuiltinTuple], [id => !!id['array.type'], _types.MetaTypeInfo.BuiltinVecFixed], [id => !!id['slice.type'], _types.MetaTypeInfo.BuiltinVec]];
const typeMap = [['enum.variants', _types.MetaTypeInfo.Enum], ['clike_enum.variants', _types.MetaTypeInfo.ClikeEnum], ['struct.fields', _types.MetaTypeInfo.Struct], ['tuple_struct.types', _types.MetaTypeInfo.TupleStruct]];

function detectedType({
  def,
  id
}) {
  (0, _util.assert)(!def['union.fields'], 'Invalid union type definition found');
  const lookup = def === 'builtin' ? builtinMap.find(([test]) => test(id)) : typeMap.find(([test]) => !!def[test]);
  return lookup ? lookup[1] : _types.MetaTypeInfo.Null;
}

class MetadataRegistryLookup {
  constructor(registry, {
    registry: {
      strings,
      types
    }
  }) {
    this.registry = void 0;
    this._strings = [];
    this._types = [];
    this.typeDefs = [];
    this.registry = registry;
    this._strings = strings;
    this._types = types;
  }

  _hasItemAt(index, variant) {
    switch (variant) {
      case _types.MetaRegistryItem.String:
        return this._strings && !!this._strings[index - 1];

      case _types.MetaRegistryItem.Type:
        return this._types && !!this._types[index - 1];

      case _types.MetaRegistryItem.TypeDef:
        return this.typeDefs && !!this.typeDefs[index - 1];
    }
  }

  _itemAt(index, variant) {
    (0, _util.assert)(this._hasItemAt(index, variant), `MetaRegistry: Invalid ${variant} index ${index} found in metadata`);

    switch (variant) {
      case _types.MetaRegistryItem.String:
        return this._strings[index - 1];

      case _types.MetaRegistryItem.Type:
        return this._types[index - 1];

      case _types.MetaRegistryItem.TypeDef:
        return this.typeDefs[index - 1];
    }
  }

  _itemsAt(indices, variant) {
    return indices.map(index => this._itemAt(index, variant));
  }

  _stringAt(index) {
    return this._itemAt(index, _types.MetaRegistryItem.String);
  }

  stringsAt(indices) {
    return this._itemsAt(indices, _types.MetaRegistryItem.String);
  }

  typeAt(index) {
    return this._itemAt(index, _types.MetaRegistryItem.Type);
  }

  typesAt(indices) {
    return this._itemsAt(indices, _types.MetaRegistryItem.Type);
  }

  hasTypeDefAt(index) {
    return this._hasItemAt(index, _types.MetaRegistryItem.TypeDef);
  }

  typeDefAt(index, extra = {}) {
    return _objectSpread(_objectSpread({}, this._itemAt(index, _types.MetaRegistryItem.TypeDef)), extra);
  }

}

class MetaRegistry extends MetadataRegistryLookup {
  constructor(registry, json) {
    super(registry, json); // Generate TypeDefs for each provided registry type

    this._types.forEach((_, index) => this.setTypeDefAtIndex(index + 1));
  }

  setTypeDefAtIndex(typeIndex) {
    this.typeDefs[typeIndex - 1] = this.typeDefFromMetaType(this.typeAt(typeIndex), typeIndex);
  }

  _typeDefIdFields({
    id
  }) {
    const {
      'custom.name': nameIndex,
      'custom.namespace': namespaceIndices,
      'custom.params': paramsIndices
    } = id;

    if (!nameIndex) {
      return {};
    }

    return _objectSpread(_objectSpread({
      name: this._stringAt(nameIndex)
    }, namespaceIndices && namespaceIndices.length ? {
      namespace: this.stringsAt(namespaceIndices).join('::')
    } : {}), paramsIndices && paramsIndices.length ? {
      params: this.typesAt(paramsIndices).map(type => this.typeDefFromMetaType(type))
    } : {});
  }

  _typeDefDefFields(metaType, typeIndex = -1) {
    let typeDef;

    switch (detectedType(metaType)) {
      case _types.MetaTypeInfo.BuiltinPlain:
        typeDef = this._typeDefForBuiltinPlain(metaType.id);
        break;

      case _types.MetaTypeInfo.BuiltinTuple:
        typeDef = this._typeDefForBuiltinTuple(metaType.id);
        break;

      case _types.MetaTypeInfo.BuiltinVec:
        typeDef = this._typeDefForBuiltinVec(metaType.id, typeIndex);
        break;

      case _types.MetaTypeInfo.BuiltinVecFixed:
        typeDef = this._typeDefForBuiltinVecFixed(metaType.id, typeIndex);
        break;

      case _types.MetaTypeInfo.Enum:
        typeDef = this._typeDefForEnum(metaType.def, metaType.id, typeIndex);
        break;

      case _types.MetaTypeInfo.ClikeEnum:
        typeDef = this._typeDefForClikeEnum(metaType.def);
        break;

      case _types.MetaTypeInfo.Struct:
        typeDef = this.typeDefForStruct(metaType.def);
        break;

      case _types.MetaTypeInfo.TupleStruct:
        typeDef = this._typeDefForTupleStruct(metaType.def);
        break;

      case _types.MetaTypeInfo.Null:
      default:
        throw new Error(`Invalid type detected at index ${typeIndex}`);
    }

    return typeDef;
  }

  typeDefFromMetaType(metaType, typeIndex) {
    return (0, _types2.withTypeString)(_objectSpread(_objectSpread({
      info: _types.TypeDefInfo.Null,
      type: ''
    }, this._typeDefDefFields(metaType, typeIndex)), this._typeDefIdFields(metaType)));
  }

  typeDefFromMetaTypeAt(typeIndex) {
    if (!this.hasTypeDefAt(typeIndex)) {
      this.setTypeDefAtIndex(typeIndex);
    }

    return this.typeDefAt(typeIndex);
  }

  _typeDefForEnumVariant(variant) {
    const {
      'unit_variant.name': unitNameIndex
    } = variant;

    if (unitNameIndex) {
      return {
        info: _types.TypeDefInfo.Plain,
        name: this._stringAt(unitNameIndex),
        type: 'Null'
      };
    }

    const {
      'tuple_struct_variant.name': tupleStructVariantNameIndex
    } = variant;

    if (tupleStructVariantNameIndex) {
      return this._typeDefForTupleStruct(variant);
    }

    const {
      'struct_variant.name': structVariantNameIndex
    } = variant;

    if (structVariantNameIndex) {
      return this.typeDefForStruct(variant);
    }

    return {
      info: _types.TypeDefInfo.Null,
      type: 'Null'
    };
  }

  _typeDefForBuiltinPlain(id) {
    return {
      info: _types.TypeDefInfo.Plain,
      type: id
    };
  }

  _typeDefForBuiltinTuple(id) {
    const sub = id.map(tupleTypeIndex => this.typeDefFromMetaTypeAt(tupleTypeIndex));
    return {
      info: _types.TypeDefInfo.Tuple,
      sub
    };
  }

  _typeDefForBuiltinVec(id, typeIndex = -1) {
    const {
      'slice.type': vecTypeIndex
    } = id;
    (0, _util.assert)(!typeIndex || vecTypeIndex !== typeIndex, `MetaRegistry: self-referencing registry type at index ${typeIndex}`);
    const type = (0, _types2.displayType)(this.typeDefFromMetaTypeAt(vecTypeIndex));
    (0, _util.assert)(type && type.length > 0, `MetaRegistry: Invalid builtin Vec type found at index ${typeIndex}`);
    return {
      info: _types.TypeDefInfo.Vec,
      sub: this.typeDefFromMetaTypeAt(vecTypeIndex),
      type: `Vec<${type}>`
    };
  }

  _typeDefForBuiltinVecFixed(id, typeIndex = -1) {
    const {
      'array.len': vecLength,
      'array.type': vecTypeIndex
    } = id;
    (0, _util.assert)(!vecLength || vecLength <= 256, 'MetaRegistry: Only support for [Type; <length>], where length <= 256');
    (0, _util.assert)(!typeIndex || vecTypeIndex !== typeIndex, `MetaRegistry: self-referencing registry type at index ${typeIndex}`);
    const type = (0, _types2.displayType)(this.typeDefFromMetaTypeAt(vecTypeIndex));
    (0, _util.assert)(type && type.length > 0, `MetaRegistry: Invalid vector type found at index ${typeIndex}`);
    return {
      info: _types.TypeDefInfo.VecFixed,
      length: vecLength,
      // ex: { type: type }
      sub: this.typeDefFromMetaTypeAt(vecTypeIndex),
      type: `[${type};${vecLength}]`
    };
  }

  _typeDefForEnum(def, id, typeIndex) {
    const name = id && this._stringAt(id['custom.name']);

    switch (name) {
      case 'Option':
        return this.typeDefForOption(id, typeIndex);

      case 'Result':
        return this.typeDefForResult(id, typeIndex);

      default:
        {
          const sub = def['enum.variants'].map(variant => this._typeDefForEnumVariant(variant));
          return {
            info: _types.TypeDefInfo.Enum,
            sub
          };
        }
    }
  }

  _typeDefForClikeEnum(def) {
    return {
      info: _types.TypeDefInfo.Enum,
      sub: def['clike_enum.variants'].map(({
        discriminant,
        name: nameIndex
      }) => ({
        ext: {
          discriminant
        },
        info: _types.TypeDefInfo.Plain,
        name: this._stringAt(nameIndex),
        type: 'Null'
      }))
    };
  }

  typeDefForOption(id, typeIndex = -1) {
    (0, _util.assert)(id['custom.params'] && id['custom.params'][0], `Invalid Option type defined at index ${typeIndex}`);
    return {
      info: _types.TypeDefInfo.Option,
      sub: this.typeDefFromMetaTypeAt(id['custom.params'][0])
    };
  }

  typeDefForResult(id, typeIndex = -1) {
    (0, _util.assert)(id['custom.params'] && id['custom.params'][0] && id['custom.params'][1], `Invalid Result type defined at index ${typeIndex}`);
    return {
      info: _types.TypeDefInfo.Result,
      sub: id['custom.params'].map(typeIndex => this.typeDefFromMetaTypeAt(typeIndex))
    };
  }

  typeDefForStruct(def) {
    const structFields = def['struct.fields'] || def['struct_variant.fields'];
    const structNameIndex = def['struct_variant.name'];
    return (0, _types2.withTypeString)(_objectSpread(_objectSpread({
      info: _types.TypeDefInfo.Struct
    }, structNameIndex ? {
      name: this._stringAt(structNameIndex)
    } : {}), {}, {
      sub: structFields.map(field => _objectSpread(_objectSpread({}, this.typeDefFromMetaTypeAt(field.type)), {}, {
        name: this._stringAt(field.name)
      }))
    }));
  }

  _typeDefForTupleStruct(def) {
    const tupleStructTypes = def['tuple_struct.types'] || def['tuple_struct_variant.types'];
    const tupleStructNameIndex = def['tuple_struct_variant.name'];
    return (0, _types2.withTypeString)(_objectSpread(_objectSpread({
      info: _types.TypeDefInfo.Tuple
    }, tupleStructNameIndex ? {
      name: this._stringAt(tupleStructNameIndex)
    } : {}), {}, {
      sub: tupleStructTypes.map((fieldIndex, index) => _objectSpread(_objectSpread({}, this.typeDefFromMetaTypeAt(fieldIndex)), {}, {
        index
      }))
    }));
  }

}

exports.default = MetaRegistry;