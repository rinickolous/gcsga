import { StringCompare } from "@module/data";
import { BaseFeature, FeatureType } from "./base";

export class SkillBonus extends BaseFeature {
	type: FeatureType = "skill_bonus";
}

export interface SkillBonus extends BaseFeature {
	selection_type: SkillBonusSelectionType;
	name?: StringCompare;
	specialization?: StringCompare;
	tags?: StringCompare;
}

export type SkillBonusSelectionType = "skills_with_name" | "weapons_with_name" | "this_weapon";
