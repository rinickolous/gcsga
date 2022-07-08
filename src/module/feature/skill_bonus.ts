import { StringCompare } from "@module/data";
import { BaseFeature, FeatureType } from "./base";

export class SkillBonus extends BaseFeature {
	type: FeatureType = "skill_bonus";

	get featureMapKey(): string {
		switch (this.selection_type) {
			case "skills_with_name":
				return this.buildKey("skill.name");
			case "this_weapon":
				return "\u0001";
			case "weapons_with_name":
				return this.buildKey("weapon_named.");
			default:
				console.error("Invalid selection type: ", this.selection_type);
				return "";
		}
	}

	buildKey(prefix: string): string {
		if (this.name?.compare == "is" && this.specialization?.compare == "none" && this.tags?.compare == "none") {
			return prefix + "/" + this.name?.qualifier;
		}
		return prefix + "*";
	}
}

export interface SkillBonus extends BaseFeature {
	selection_type: SkillBonusSelectionType;
	name?: StringCompare;
	specialization?: StringCompare;
	tags?: StringCompare;
}

export type SkillBonusSelectionType = "skills_with_name" | "weapons_with_name" | "this_weapon";
