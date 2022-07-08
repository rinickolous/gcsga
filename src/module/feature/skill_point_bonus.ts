import { BaseFeature, FeatureType } from "./base";
import { StringCompare } from "@module/data";

export class SkillPointBonus extends BaseFeature {
	type: FeatureType = "skill_point_bonus";

	get featureMapKey(): string {
		if (this.name?.compare == "is" && this.specialization?.compare == "none" && this.tags?.compare == "none") {
			return "skill.points" + "/" + this.name?.qualifier;
		}
		return "skill.points" + "*";
	}
}

export interface SkillPointBonus extends BaseFeature {
	name?: StringCompare;
	specialization?: StringCompare;
	tags?: StringCompare;
}
