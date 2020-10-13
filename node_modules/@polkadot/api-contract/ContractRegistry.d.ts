import { TypeDef } from '@polkadot/types/types';
import { ContractABIArgBasePre, ContractABIContract, ContractABIContractPre, ContractABIEvent, ContractABIEventPre, ContractABIFn, ContractABIMessage, ContractABIMessageBase, ContractABIMessagePre, ContractABI, ContractABIPre, ContractABIRange, ContractABIRangePre, ContractABIStorage, ContractABIStorageLayout, ContractABIStorageLayoutPre, ContractABIStoragePre, ContractABIStorageStruct, ContractABIStorageStructPre, ContractABITypePre } from './types';
import MetaRegistry from './MetaRegistry';
export default class ContractRegistry extends MetaRegistry {
    validateArgs(name: string, args: ContractABIArgBasePre[]): void;
    validateConstructors({ contract: { constructors } }: ContractABIPre): void;
    validateMessages({ contract: { messages } }: ContractABIPre): void;
    validateAbi(abi: ContractABIPre): void;
    createMessage(name: string, message: Partial<ContractABIMessage> & ContractABIMessageBase): ContractABIFn;
    convertAbi({ contract, storage }: ContractABIPre): ContractABI;
    convertArgs(args: ContractABIArgBasePre[]): any[];
    convertType({ display_name: displayNameIndices, ty }: ContractABITypePre): TypeDef;
    convertContract({ constructors, events, messages, name, ...contract }: ContractABIContractPre): ContractABIContract;
    convertConstructors(constructors: ContractABIMessagePre[]): ContractABIMessage[];
    convertMessage({ args, name, return_type: returnType, ...message }: ContractABIMessagePre): ContractABIMessage;
    convertEvent({ args }: ContractABIEventPre): ContractABIEvent;
    convertStorage(storage: ContractABIStoragePre): ContractABIStorage;
    convertStorageLayout(storageLayout: ContractABIStorageLayoutPre): ContractABIStorageLayout;
    convertStorageStruct({ 'struct.fields': structFields, 'struct.type': structType }: ContractABIStorageStructPre): ContractABIStorageStruct;
    convertStorageRange({ 'range.elem_type': type, ...range }: ContractABIRangePre): ContractABIRange;
}
