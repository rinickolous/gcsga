import { ActorDataSource } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/actorData";
import { ActorGURPS } from ".";

export type ActorType = "character" | "element" | "vehicle" | "merchant" | "trap";

export interface ActorFlagsGURPS extends Record<string, unknown> {
	gcsga?: Record<string, unknown>;
}

export interface BaseActorSourceGURPS<
	TActorType extends ActorType = ActorType,
	TSystemData extends ActorSystemData = ActorSystemData,
> extends ActorDataSource {
	type: TActorType;
	data: TSystemData;
	flags: DeepPartial<ActorFlagsGURPS>;
}

export abstract class BaseActorDataGURPS<TActor extends ActorGURPS = ActorGURPS> extends foundry.data.ActorData {}

export interface BaseActorDataGURPS extends Omit<BaseActorSourceGURPS, "effects" | "items" | "token"> {
	type: ActorType;
	data: ActorSystemData;
	flags: ActorFlagsGURPS;

	readonly _source: BaseActorSourceGURPS;
}

export interface ActorSystemData {
	id: string;
	type: ActorType;
}
