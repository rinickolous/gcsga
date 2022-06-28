import { BaseItemDataGURPS, BaseItemSourceGURPS, ItemSystemData } from "@item/base/data";
import { SkillDefault } from "@item/skill/skill_default";
import { Weapon } from "@module/data";
import { Feature } from "@module/feature";
import { PrereqList } from "@module/prereq";
import { TechniqueGURPS } from ".";

export type TechniqueSource = BaseItemSourceGURPS<"technique", TechniqueSystemData>;

export class TechniqueData extends BaseItemDataGURPS<TechniqueGURPS> {}

export interface TechniqueData extends Omit<TechniqueSource, "effects" | "flags"> {
	readonly type: TechniqueSource["type"];
	data: TechniqueSystemData;

	readonly _source: TechniqueSource;
}

export interface TechniqueSystemData extends ItemSystemData {
	prereqs: PrereqList;
	specialization: string;
	tech_level: string;
	encumbrance_penalty_multiplier: EncumbrancePenaltyMultiplier;
	// may change to object type
	difficulty: string;
	points: number;
	// to change later
	defaulted_from: any;
	weapons: Weapon;
	defaults: SkillDefault[];
	features: Feature[];
	calc: {
		level: number;
		rsl: string;
	};
	default: SkillDefault;
	limit: number;
}

export type EncumbrancePenaltyMultiplier = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
