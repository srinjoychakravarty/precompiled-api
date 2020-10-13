import { AccountId } from '@polkadot/types/interfaces';
import { ContractABIPre } from '../types';
import { ApiRx } from '@polkadot/api';
import Abi from '../Abi';
import Contract from '../base/Contract';
export default class RxContract extends Contract<'rxjs'> {
    constructor(api: ApiRx, abi: ContractABIPre | Abi, address: string | AccountId);
}
