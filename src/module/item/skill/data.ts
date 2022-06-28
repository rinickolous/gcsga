import { BaseItemDataGURPS, BaseItemSourceGURPS, ItemSystemData } from "@item/base/data";
import { ObjArray, Weapon, Default, DefaultedFrom } from "@module/data";
import { Feature } from "@module/feature";
import { PrereqList } from "@module/prereq";
import { SkillGURPS } from ".";

export type SkillSource = BaseItemSourceGURPS<"skill", SkillSystemData>;

export class SkillData extends BaseItemDataGURPS<SkillGURPS> {}

export interface SkillData extends Omit<SkillSource, "effects" | "flags"> {
	readonly type: SkillSource["type"];
	data: SkillSystemData;

	readonly _source: SkillSource;
}

export interface SkillSystemData extends ItemSystemData {
	prereqs: PrereqList;
	specialization: string;
	tech_level: string;
	encumbrance_penalty_multiplier: EncumbrancePenaltyMultiplier;
	// may change to object type
	difficulty: string;
	points: number;
	// to change later
	defaulted_from: DefaultedFrom;
	weapons: ObjArray<Weapon>;
	defaults: ObjArray<Default>;
	features: Feature[];
	calc: {
		level: number;
		rsl: string;
		points: number;
	};
}

export type EncumbrancePenaltyMultiplier = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface SkillLevel {
	level: number;
	relative_level: number;
	tooltip: string;
}
