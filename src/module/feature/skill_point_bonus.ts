import { BaseFeature, FeatureType } from "./base";
import { StringCompare } from "@module/data";

export class SkillPointBonus extends BaseFeature {
	type: FeatureType = "skill_point_bonus";
}

export interface SkillPointBonus extends BaseFeature {
	name?: StringCompare;
	specialization?: StringCompare;
	tags?: StringCompare;
}
