import { ActorFlagsGURPS, ActorSystemData, ActorType, BaseActorSourceGURPS } from "@actor/base/data";

export const MoveModeTypes = {
	Ground: "gurps.character.move_modes.ground",
	Air: "gurps.character.move_modes.air",
	Water: "gurps.character.move_modes.water",
	Space: "gurps.character.move_modes.space",
};

export enum Posture {
	Standing = "standing",
}

export interface MoveMode {
	mode: typeof MoveModeTypes | string;
	basic: number;
	enhanced?: number;
	default: boolean;
}

export interface StaticCharacterSource extends BaseActorSourceGURPS<ActorType.CharacterGCA, StaticCharacterSystemData> {
	flags: DeepPartial<StaticCharacterFlags>;
}
export interface StaticCharacterDataGURPS
	extends Omit<StaticCharacterSource, "effects" | "flags" | "items" | "token">,
		StaticCharacterSystemData {
	readonly type: StaticCharacterSource["type"];
	data: StaticCharacterSystemData;
	flags: StaticCharacterFlags;

	readonly _source: StaticCharacterSource;
}

type StaticCharacterFlags = ActorFlagsGURPS & {
	gurps: {
		// Empty
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
	conditions: any;
	traits: any;
	encumbrance: any;
	basicmove: any;
	move: any;
	attributes: any;
	ads: any;
	skills: any;
	spells: any;
	equipment: any;
	melee: any;
	ranged: any;
	currentdodge: any;
	languages: any;
}
