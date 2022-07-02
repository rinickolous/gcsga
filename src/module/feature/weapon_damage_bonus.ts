import { BaseFeature, FeatureType } from "./base";
import { NumberCompare, StringCompare } from "@module/data";

export class WeaponBonus extends BaseFeature {
	type: FeatureType = "weapon_bonus";
}
export interface WeaponBonus extends BaseFeature {
	selection_type: WeaponBonusSelectionType;
	name?: StringCompare;
	specialization?: StringCompare;
	tags?: StringCompare;
	level?: NumberCompare;
}

export type WeaponBonusSelectionType = "weapons_with_required_skill" | "weapons_with_name" | "this_weapon";
