import { BaseFeature, FeatureType } from "./base";
import { StringCompare } from "@module/data";

export class SpellBonus extends BaseFeature {
	type: FeatureType = "spell_bonus";

	get featureMapKey(): string {
		if (this.tags?.compare != "none") {
			return "spell.points" + "*";
		}
		switch (this.match) {
			case "all_colleges":
				return "spell.college";
			case "college_name":
				return this.buildKey("spell.college");
			case "power_source_name":
				return this.buildKey("spell.power_source");
			case "spell_name":
				return this.buildKey("spell");
			default:
				console.error("Invalid match type: ", this.match);
				return "";
		}
	}

	buildKey(prefix: string): string {
		if (this.name?.compare == "is") {
			return prefix + "/" + this.name.qualifier;
		}
		return prefix + "*";
	}
}

export interface SpellBonus extends BaseFeature {
	match: SpellBonusMatch;
	name?: StringCompare;
	tags?: StringCompare;
}

export type SpellBonusMatch = "all_colleges" | "college_name" | "spell_name" | "power_source_name";
