import {
	ActorFlagsGURPS,
	ActorSystemData,
	ActorType,
	BaseActorSourceGURPS,
} from "@actor/base/data";

export const MoveModeTypes = {
	Ground: "GURPS.moveModeGround",
	Air: "GURPS.moveModeAir",
	Water: "GURPS.moveModeWater",
	Space: "GURPS.moveModeSpace",
};

export interface MoveMode {
	mode: typeof MoveModeTypes | string;
	basic: number;
	enhanced?: number;
	default: boolean;
}

export interface StaticCharacterSource
	extends BaseActorSourceGURPS<
		ActorType.CharacterGCA,
		StaticCharacterSystemData
	> {
	flags: DeepPartial<StaticCharacterFlags>;
}
export interface StaticCharacterDataGURPS
	extends Omit<
			StaticCharacterSource,
			"effects" | "flags" | "items" | "token"
		>,
		StaticCharacterSystemData {
	readonly type: StaticCharacterSource["type"];
	data: StaticCharacterSystemData;
	flags: StaticCharacterFlags;

	readonly _source: StaticCharacterSource;
}

type StaticCharacterFlags = ActorFlagsGURPS & {
	gurps: {
		// empty
	};
};

export interface StaticCharacterSystemData extends ActorSystemData {
	pools: {
		[key: string]: {
			value: number;
			min: number;
			max: number;
			points: number;
		};
	};
	// TODO: change
	ads: any;
	conditions: any;
	traits: any;
	encumbrance: any;
	basicmove: any;
	move: any;
}
