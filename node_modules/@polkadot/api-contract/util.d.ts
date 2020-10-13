import { Codec, Registry, TypeDef } from '@polkadot/types/types';
import { Raw } from '@polkadot/types';
export declare function formatData(registry: Registry, data: Raw, { info, type }: TypeDef): Codec;
