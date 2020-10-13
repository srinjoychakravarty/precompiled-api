import { MetaRegistryItem, MetaRegistryJson, MetaType, MetaTypeDefEnumVariantStruct, MetaTypeDefStruct, MetaTypeIdCustom, Registry, StringIndex, TypeDef, TypeIndex } from '@polkadot/types/types';
declare class MetadataRegistryLookup {
    readonly registry: Registry;
    protected _strings: string[];
    protected _types: MetaType[];
    typeDefs: TypeDef[];
    constructor(registry: Registry, { registry: { strings, types } }: MetaRegistryJson);
    protected _hasItemAt(index: number, variant: MetaRegistryItem): boolean;
    protected _itemAt(index: number, variant: MetaRegistryItem): string | MetaType | TypeDef;
    protected _itemsAt(indices: number[], variant: MetaRegistryItem): (string | MetaType | TypeDef)[];
    protected _stringAt(index: StringIndex): string;
    stringsAt(indices: StringIndex[]): string[];
    typeAt(index: TypeIndex): MetaType;
    typesAt(indices: TypeIndex[]): MetaType[];
    hasTypeDefAt(index: TypeIndex): boolean;
    typeDefAt(index: TypeIndex, extra?: Pick<TypeDef, never>): TypeDef;
}
export default class MetaRegistry extends MetadataRegistryLookup {
    constructor(registry: Registry, json: MetaRegistryJson);
    setTypeDefAtIndex(typeIndex: TypeIndex): void;
    private _typeDefIdFields;
    private _typeDefDefFields;
    typeDefFromMetaType(metaType: MetaType, typeIndex?: TypeIndex): TypeDef;
    typeDefFromMetaTypeAt(typeIndex: TypeIndex): TypeDef;
    private _typeDefForEnumVariant;
    private _typeDefForBuiltinPlain;
    private _typeDefForBuiltinTuple;
    private _typeDefForBuiltinVec;
    private _typeDefForBuiltinVecFixed;
    private _typeDefForEnum;
    private _typeDefForClikeEnum;
    typeDefForOption(id: MetaTypeIdCustom, typeIndex?: TypeIndex): Pick<TypeDef, any>;
    typeDefForResult(id: MetaTypeIdCustom, typeIndex?: TypeIndex): Pick<TypeDef, any>;
    typeDefForStruct(def: MetaTypeDefStruct | MetaTypeDefEnumVariantStruct): Pick<TypeDef, any>;
    private _typeDefForTupleStruct;
}
export {};
