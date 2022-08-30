import { Feature } from "@feature";
import { BaseItemSourceGURPS, ItemSystemData } from "@item/base/data";
import { Difficulty } from "@module/data";
import { SkillDefault } from "@module/default";
import { TooltipGURPS } from "@module/tooltip";
import { Weapon } from "@module/weapon";
import { PrereqList } from "@prereq";

export type SkillSource = BaseItemSourceGURPS<"skill", SkillSystemData>;

// export class SkillData extends BaseItemDataGURPS<SkillGURPS> {}

export interface SkillData
	extends Omit<SkillSource, "effects">,
		SkillSystemData {
	readonly type: SkillSource["type"];
	data: SkillSystemData;

	readonly _source: SkillSource;
}

export interface SkillSystemData extends ItemSystemData {
	prereqs: PrereqList;
	specialization: string;
	tech_level: string;
	// should not be needed
	// TODO: find a way to remove
	tech_level_required: boolean;
	encumbrance_penalty_multiplier: EncumbrancePenaltyMultiplier;
	// may change to object type
	difficulty: string;
	points: number;
	// to change later
	defaulted_from?: SkillDefault;
	weapons: Weapon[];
	defaults: SkillDefault[];
	features: Feature[];
	// calc: {
	// 	level: number;
	// 	rsl: string;
	// 	points: number;
	// };
}

export type EncumbrancePenaltyMultiplier =
	| 0
	| 1
	| 2
	| 3
	| 4
	| 5
	| 6
	| 7
	| 8
	| 9;

export interface SkillLevel {
	level: number;
	relative_level: number;
	tooltip: TooltipGURPS | string;
}

export function baseRelativeLevel(d: string): number {
	switch (d) {
		case Difficulty.Easy:
			return 0;
		case Difficulty.Average:
			return -1;
		case Difficulty.Hard:
			return -2;
		case Difficulty.VeryHard:
		case Difficulty.Wildcard:
			return -3;
		default:
			return baseRelativeLevel(Difficulty.Easy);
	}
}
