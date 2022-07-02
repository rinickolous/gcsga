import { BaseFeature, FeatureType } from "./base";
import { StringCompare } from "@module/data";

export class SpellBonus extends BaseFeature {
	type: FeatureType = "spell_bonus";
}

export interface SpellBonus extends BaseFeature {
	match: SpellBonusMatch;
	name?: StringCompare;
	tags?: StringCompare;
}

export type SpellBonusMatch = "all_colleges" | "college_name" | "spell_name" | "power_source_name";
