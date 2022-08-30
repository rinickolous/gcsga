import { Feature } from "@feature";
import { BaseItemSourceGURPS, ItemSystemData } from "@item/base/data";
import { EncumbrancePenaltyMultiplier } from "@item/skill/data";
import { SkillDefault } from "@module/default";
import { Weapon } from "@module/weapon";
import { PrereqList } from "@prereq";

export type TechniqueSource = BaseItemSourceGURPS<
	"technique",
	TechniqueSystemData
>;

// export class TechniqueData extends BaseItemDataGURPS<TechniqueGURPS> {}

export interface TechniqueData
	extends Omit<TechniqueSource, "effects">,
		TechniqueSystemData {
	readonly type: TechniqueSource["type"];
	data: TechniqueSystemData;

	readonly _source: TechniqueSource;
}

export interface TechniqueSystemData extends ItemSystemData {
	prereqs: PrereqList;
	tech_level: string;
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
	// };
	default: SkillDefault;
	limit: number;
	limited: boolean;
}
