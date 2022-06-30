import { AttributeBonus } from "./attribute_bonus";
import { ConditionalModifier } from "./conditional_modifier";
import { ContainedWeightReduction } from "./contained_weight_reduction";
import { CostReduction } from "./cost_reduction";
import { DRBonus } from "./dr_bonus";
import { ReactionBonus } from "./reaction_bonus";
import { SkillBonus } from "./skill_bonus";
import { SkillPointBonus } from "./skill_point_bonus";
import { SpellBonus } from "./spell_bonus";
import { SpellPointBonus } from "./spell_point_bonus";
import { WeaponBonus } from "./weapon_damage_bonus";

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

export const featureClasses = {
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

export { AttributeBonus } from "./attribute_bonus";
export { ConditionalModifier } from "./conditional_modifier";
export { ContainedWeightReduction } from "./contained_weight_reduction";
export { CostReduction } from "./cost_reduction";
export { DRBonus } from "./dr_bonus";
export { ReactionBonus } from "./reaction_bonus";
export { SkillBonus } from "./skill_bonus";
export { SkillPointBonus } from "./skill_point_bonus";
export { SpellBonus } from "./spell_bonus";
export { SpellPointBonus } from "./spell_point_bonus";
export { WeaponBonus } from "./weapon_damage_bonus";
