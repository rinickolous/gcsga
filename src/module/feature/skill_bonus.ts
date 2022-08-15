import { StringCompare, StringComparison } from "@module/data";
import { BaseFeature } from "./base";

export class SkillBonus extends BaseFeature {
	static get defaults(): Record<string, any> {
		return mergeObject(super.defaults, {
			type: "skill_bonus",
			selection_type: "skills_with_name",
			name: { compare: StringComparison.None, qualifier: "" },
			specialization: { compare: StringComparison.None, qualifier: "" },
			tags: { compare: StringComparison.None, qualifier: "" },
		});
	}

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
