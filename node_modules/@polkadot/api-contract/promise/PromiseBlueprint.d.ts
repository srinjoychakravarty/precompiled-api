import { Hash } from '@polkadot/types/interfaces';
import { ContractABIPre } from '../types';
import { ApiPromise } from '@polkadot/api';
import Abi from '../Abi';
import Blueprint from '../base/Blueprint';
export default class PromiseBlueprint extends Blueprint<'promise'> {
    constructor(api: ApiPromise, abi: ContractABIPre | Abi, codeHash: string | Hash);
}
