import { ContractABIPre } from '../types';
import { ApiPromise } from '@polkadot/api';
import Abi from '../Abi';
import Code from '../base/Code';
export default class PromiseCode extends Code<'promise'> {
    constructor(api: ApiPromise, abi: ContractABIPre | Abi, wasm: string | Uint8Array);
}
