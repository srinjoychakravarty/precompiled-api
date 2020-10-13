import { ApiTypes, DecorateMethod } from '@polkadot/api/types';
import { AccountId, Address, Hash } from '@polkadot/types/interfaces';
import { IKeyringPair, ISubmittableResult } from '@polkadot/types/types';
import { ApiObject, ContractABIPre } from '../types';
import BN from 'bn.js';
import { Observable } from 'rxjs';
import { SubmittableResult } from '@polkadot/api';
import Abi from '../Abi';
import Contract from './Contract';
import { BaseWithTx } from './util';
declare type BlueprintCreateResultSubscription<ApiType extends ApiTypes> = Observable<BlueprintCreateResult<ApiType>>;
export interface BlueprintCreate<ApiType extends ApiTypes> {
    signAndSend(account: IKeyringPair | string | AccountId | Address): BlueprintCreateResultSubscription<ApiType>;
}
declare class BlueprintCreateResult<ApiType extends ApiTypes> extends SubmittableResult {
    readonly contract?: Contract<ApiType>;
    constructor(result: ISubmittableResult, contract?: Contract<ApiType>);
}
export default class Blueprint<ApiType extends ApiTypes> extends BaseWithTx<ApiType> {
    readonly codeHash: Hash;
    constructor(api: ApiObject<ApiType>, abi: ContractABIPre | Abi, decorateMethod: DecorateMethod<ApiType>, codeHash: string | Hash);
    deployContract(constructorIndex: number | undefined, endowment: number | BN, maxGas: number | BN, ...params: any[]): BlueprintCreate<ApiType>;
    private _createResult;
}
export {};
