import { BaseFeature, FeatureType } from "./base";
import { StringCompare } from "@module/data";
import { SpellBonusMatch } from "./spell_bonus";

export class SpellPointBonus extends BaseFeature {
	type: FeatureType = "spell_bonus";

	get featureMapKey(): string {
		if (this.tags?.compare != "none") {
			return "spell.points" + "*";
		}
		switch (this.match) {
			case "all_colleges":
				return "spell.college.points";
			case "college_name":
				return this.buildKey("spell.college.points");
			case "power_source_name":
				return this.buildKey("spell.power_source.points");
			case "spell_name":
				return this.buildKey("spell.points");
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

export interface SpellPointBonus extends BaseFeature {
	match: SpellBonusMatch;
	name?: StringCompare;
	tags?: StringCompare;
}
