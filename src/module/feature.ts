import { StringCompare, NumberCompare } from "./data";

export type FeatureType =
	| "attribute_bonus"
	| "conditional_modifier"
	| "dr_bonus"
	| "reaction_bonus"
	| "skill_bonus"
	| "skill_point_bonus"
	| "spell_bonus"
	| "spell_point_bonus"
	| "weapon_bonus"
	| "cost_reduction"
	| "contained_weight_reduction";

export interface FeatureConstructionContext {
	ready?: boolean;
}

export type Feature =
	| AttributeBonus
	| ConditionalModifier
	| DRBonus
	| ReactionBonus
	| SkillBonus
	| SkillPointBonus
	| SpellBonus
	| SpellPointBonus
	| WeaponBonus
	| CostReduction
	| ContainedWeightReduction;

export class BaseFeature {
	type: FeatureType;
	item?: string;
	amount = 1;
	per_level = false;
	levels?: number;

	constructor(data: Feature | any, context: FeatureConstructionContext = {}) {
		this.type = data.type;
		if (context.ready) {
			Object.assign(this, data);
		} else {
			mergeObject(context, {
				ready: true,
			});
			const FeatureConstructor = classes[data.type as FeatureType];
			return FeatureConstructor ? new FeatureConstructor(data, context) : new BaseFeature(data, context);
		}
	}

	static get default() {
		return new AttributeBonus({ type: "attribute_bonus", attribute: "st", amount: 1, per_level: false });
	}

	get calc_amount(): number {
		return this.amount * (this.per_level ? this.levels || 0 : 1);
	}
}

export class AttributeBonus extends BaseFeature {}
export class ConditionalModifier extends BaseFeature {}
export class DRBonus extends BaseFeature {}
export class ReactionBonus extends BaseFeature {}
export class SkillBonus extends BaseFeature {}
export class SkillPointBonus extends BaseFeature {}
export class SpellBonus extends BaseFeature {}
export class SpellPointBonus extends BaseFeature {}
export class WeaponBonus extends BaseFeature {}
export class CostReduction extends BaseFeature {}
export class ContainedWeightReduction extends BaseFeature {}

export interface AttributeBonus extends BaseFeature {
	attribute: string;
}
export interface ConditionalModifier extends BaseFeature {
	situation: string;
}
export interface DRBonus extends BaseFeature {
	location: string;
	specialization?: string;
}
export interface ReactionBonus extends BaseFeature {
	situation: string;
}
export interface SkillBonus extends BaseFeature {
	selection_type: SkillBonusSelection;
	name?: StringCompare;
	specialization?: StringCompare;
	tags?: StringCompare;
}
export interface SkillPointBonus extends BaseFeature {
	name?: StringCompare;
	specialization?: StringCompare;
	tags?: StringCompare;
}
export interface SpellBonus extends BaseFeature {
	match: SpellBonusMatch;
	name?: StringCompare;
	tags?: StringCompare;
}
export interface SpellPointBonus extends BaseFeature {
	match: SpellBonusMatch;
	name?: StringCompare;
	tags?: StringCompare;
}
export interface WeaponBonus extends BaseFeature {
	selection_type: WeaponBonusSelectionType;
	name?: StringCompare;
	specialization?: StringCompare;
	tags?: StringCompare;
	level?: NumberCompare;
}
export interface CostReduction extends BaseFeature {
	attribute: string;
	percentage: number;
}
export interface ContainedWeightReduction extends BaseFeature {
	percentage: number;
}

export type SkillBonusSelection = "skills_with_name" | "weapons_with_name" | "this_weapon";

export type SpellBonusMatch = "all_colleges" | "college_name" | "spell_name" | "power_source_name";

export type WeaponBonusSelectionType = "weapons_with_required_skill" | "weapons_with_name" | "this_weapon";

const classes = {
	attribute_bonus: AttributeBonus,
	conditional_modifier: ConditionalModifier,
	dr_bonus: DRBonus,
	reaction_bonus: ReactionBonus,
	skill_bonus: SkillBonus,
	skill_point_bonus: SkillPointBonus,
	spell_bonus: SpellBonus,
	spell_point_bonus: SpellPointBonus,
	weapon_bonus: WeaponBonus,
	cost_reduction: CostReduction,
	contained_weight_reduction: ContainedWeightReduction,
};
