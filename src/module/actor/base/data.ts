import { BaseActorGURPS } from "@actor";
import { ActorDataSource } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/actorData";

export type ActorType = "character" | "element" | "vehicle" | "merchant" | "trap";

export interface ActorFlagsGURPS extends Record<string, unknown> {
	gcsga?: Record<string, unknown>;
}

export interface BaseActorSourceGURPS<TActorType extends ActorType = ActorType, TSystemData extends ActorSystemData = ActorSystemData> extends ActorDataSource {
	type: TActorType;
	data: TSystemData;
	flags: DeepPartial<ActorFlagsGURPS>;
}

export abstract class BaseActorDataGURPS<TActor extends BaseActorGURPS = BaseActorGURPS> extends foundry.data.ActorData {}

export interface ActorSystemData {
	id: string;
	type: ActorType;
}
