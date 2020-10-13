import { ApiTypes, DecorateMethod } from '@polkadot/api/types';
import { AccountId, Address } from '@polkadot/types/interfaces';
import { IKeyringPair, ISubmittableResult } from '@polkadot/types/types';
import { ApiObject, ContractABIPre } from '../types';
import BN from 'bn.js';
import { Observable } from 'rxjs';
import { SubmittableResult } from '@polkadot/api';
import Abi from '../Abi';
import Blueprint from './Blueprint';
import { BaseWithTx } from './util';
declare type CodePutCodeResultSubscription<ApiType extends ApiTypes> = Observable<CodePutCodeResult<ApiType>>;
export interface CodePutCode<ApiType extends ApiTypes> {
    signAndSend(account: IKeyringPair | string | AccountId | Address): CodePutCodeResultSubscription<ApiType>;
}
declare class CodePutCodeResult<ApiType extends ApiTypes> extends SubmittableResult {
    readonly blueprint?: Blueprint<ApiType>;
    constructor(result: ISubmittableResult, blueprint?: Blueprint<ApiType>);
}
export default class Code<ApiType extends ApiTypes> extends BaseWithTx<ApiType> {
    readonly code: Uint8Array;
    constructor(api: ApiObject<ApiType>, abi: ContractABIPre | Abi, decorateMethod: DecorateMethod<ApiType>, wasm: string | Uint8Array);
    createBlueprint: (maxGas: number | BN) => CodePutCode<ApiType>;
    private _createResult;
}
export {};
