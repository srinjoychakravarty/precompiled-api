import { ContractABIPre } from '../types';
import { ApiRx } from '@polkadot/api';
import Abi from '../Abi';
import Code from '../base/Code';
export default class RxCode extends Code<'rxjs'> {
    constructor(api: ApiRx, abi: ContractABIPre | Abi, wasm: string | Uint8Array);
}
