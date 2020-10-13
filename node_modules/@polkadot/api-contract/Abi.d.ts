import { Registry } from '@polkadot/types/types';
import { AbiConstructors, AbiMessages, ContractABI, ContractABIPre, InterfaceAbi } from './types';
import ContractRegistry from './ContractRegistry';
export default class ContractAbi extends ContractRegistry implements InterfaceAbi {
    readonly abi: ContractABI;
    readonly constructors: AbiConstructors;
    readonly messages: AbiMessages;
    constructor(registry: Registry, abi: ContractABIPre);
    private _decodeAbi;
}
