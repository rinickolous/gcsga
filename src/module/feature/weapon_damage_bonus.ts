import { BaseFeature, FeatureType } from "./base";
import { NumberCompare, StringCompare } from "@module/data";

export class WeaponBonus extends BaseFeature {
	type: FeatureType = "weapon_bonus";
	percent = false;

	get featureMapKey(): string {
		switch (this.selection_type) {
			case "weapons_with_required_skill":
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
export interface WeaponBonus extends BaseFeature {
	selection_type: WeaponBonusSelectionType;
	name?: StringCompare;
	specialization?: StringCompare;
	tags?: StringCompare;
	level?: NumberCompare;
	percent: boolean;
}

export type WeaponBonusSelectionType = "weapons_with_required_skill" | "weapons_with_name" | "this_weapon";
