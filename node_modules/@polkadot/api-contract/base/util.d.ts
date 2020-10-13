import { ApiTypes, DecorateMethod, DecoratedRpc, SubmittableModuleExtrinsics } from '@polkadot/api/types';
import { RpcInterface } from '@polkadot/rpc-core/types';
import { Registry } from '@polkadot/types/types';
import { ApiObject, ContractABIPre, ContractBase, ContractMessage } from '../types';
import Abi from '../Abi';
export declare abstract class Base<ApiType extends ApiTypes> implements ContractBase<ApiType> {
    readonly abi: Abi;
    readonly api: ApiObject<ApiType>;
    readonly decorateMethod: DecorateMethod<ApiType>;
    readonly registry: Registry;
    constructor(api: ApiObject<ApiType>, abi: ContractABIPre | Abi, decorateMethod: DecorateMethod<ApiType>);
    get messages(): ContractMessage[];
    getMessage(nameOrIndex?: string | number): ContractMessage;
}
export declare abstract class BaseWithTx<ApiType extends ApiTypes> extends Base<ApiType> {
    protected get _apiContracts(): SubmittableModuleExtrinsics<'rxjs'>;
    constructor(api: ApiObject<ApiType>, abi: ContractABIPre | Abi, decorateMethod: DecorateMethod<ApiType>);
}
export declare abstract class BaseWithTxAndRpcCall<ApiType extends ApiTypes> extends BaseWithTx<ApiType> {
    get hasRpcContractsCall(): boolean;
    protected get _rpcContractsCall(): DecoratedRpc<'rxjs', RpcInterface>['contracts']['call'];
}
