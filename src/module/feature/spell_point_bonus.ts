import { FeatureType } from "@feature";
import { BaseFeature } from "./base";
import { StringCompare } from "@module/data";
import { SpellBonusMatch } from "./spell_bonus";

export class SpellPointBonus extends BaseFeature {
	type: FeatureType = "spell_bonus";
}

export interface SpellPointBonus extends BaseFeature {
	match: SpellBonusMatch;
	name?: StringCompare;
	tags?: StringCompare;
}
