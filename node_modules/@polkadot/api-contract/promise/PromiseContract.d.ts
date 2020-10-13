import { AccountId } from '@polkadot/types/interfaces';
import { ContractABIPre } from '../types';
import { ApiPromise } from '@polkadot/api';
import Abi from '../Abi';
import Contract from '../base/Contract';
export default class PromiseContract extends Contract<'promise'> {
    constructor(api: ApiPromise, abi: ContractABIPre | Abi, address: string | AccountId);
}
