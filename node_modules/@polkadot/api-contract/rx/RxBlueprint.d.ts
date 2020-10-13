import { Hash } from '@polkadot/types/interfaces';
import { ContractABIPre } from '../types';
import { ApiRx } from '@polkadot/api';
import Abi from '../Abi';
import Blueprint from '../base/Blueprint';
export default class RxBlueprint extends Blueprint<'rxjs'> {
    constructor(api: ApiRx, abi: ContractABIPre | Abi, codeHash: string | Hash);
}
