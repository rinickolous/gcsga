import { CharacterGURPS } from "@actor/character";
import { AttributeBonus } from "@feature/attribute_bonus";
import { ConditionalModifier } from "@feature/conditional_modifier";
import { ContainedWeightReduction } from "@feature/contained_weight_reduction";
import { CostReduction } from "@feature/cost_reduction";
import { DRBonus } from "@feature/dr_bonus";
import { ReactionBonus } from "@feature/reaction_bonus";
import { SkillBonus } from "@feature/skill_bonus";
import { SkillPointBonus } from "@feature/skill_point_bonus";
import { SpellBonus } from "@feature/spell_bonus";
import { SpellPointBonus } from "@feature/spell_point_bonus";
import { WeaponBonus } from "@feature/weapon_damage_bonus";
import {
	BaseItemGURPS,
	EquipmentContainerGURPS,
	EquipmentGURPS,
	EquipmentModifierGURPS,
	NoteContainerGURPS,
	NoteGURPS,
	RitualMagicSpellGURPS,
	SkillContainerGURPS,
	SkillGURPS,
	SpellContainerGURPS,
	SpellGURPS,
	TechniqueGURPS,
	TraitContainerGURPS,
	TraitGURPS,
	TraitModifierGURPS,
} from "@item";
import { AttributePrereq } from "@prereq/attribute_prereq";
import { ContainedQuantityPrereq } from "@prereq/contained_quantity_prereq";
import { ContainedWeightPrereq } from "@prereq/contained_weight_prereq";
import { PrereqList } from "@prereq/prereq_list";
import { SkillPrereq } from "@prereq/skill_prereq";
import { SpellPrereq } from "@prereq/spell_prereq";
import { TraitPrereq } from "@prereq/trait_prereq";
import { MeleeWeapon, RangedWeapon } from "./weapon";

// const GURPSCONFIG: any = CONFIG;
const GURPSCONFIG: any = {
	Item: {
		documentClasses: {
			base: BaseItemGURPS,
			trait: TraitGURPS,
			trait_container: TraitContainerGURPS,
			modifier: TraitModifierGURPS,
			skill: SkillGURPS,
			technique: TechniqueGURPS,
			skill_container: SkillContainerGURPS,
			spell: SpellGURPS,
			ritual_magic_spell: RitualMagicSpellGURPS,
			spell_container: SpellContainerGURPS,
			equipment: EquipmentGURPS,
			equipment_container: EquipmentContainerGURPS,
			eqp_modifier: EquipmentModifierGURPS,
			note: NoteGURPS,
			note_container: NoteContainerGURPS,
		},
	},
	Actor: {
		documentClasses: {
			character: CharacterGURPS,
		},
	},
	Feature: {
		classes: {
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
		},
	},
	Prereq: {
		classes: {
			prereq_list: PrereqList,
			trait_prereq: TraitPrereq,
			attribute_prereq: AttributePrereq,
			contained_quantity_prereq: ContainedQuantityPrereq,
			contained_weight_prereq: ContainedWeightPrereq,
			skill_prereq: SkillPrereq,
			spell_prereq: SpellPrereq,
		},
	},
	Weapon: {
		classes: {
			melee_weapon: MeleeWeapon,
			ranged_weapon: RangedWeapon,
		},
	},
	select: {
		cr_level: {
			0: "0",
			6: "6",
			9: "9",
			12: "12",
			15: "15",
		},
		cr_adj: {
			action_penalty: "action_penalty",
			reaction_penalty: "reaction_penalty",
			fright_check_penalty: "fright_check_penalty",
			fright_check_bonus: "fright_check_bonus",
			minor_cost_of_living_increase: "minor_cost_of_living_increase",
			major_cost_of_living_increase: "major_cost_of_living_increase",
		},
		number_compare: {
			none: "none",
			is: "is",
			is_not: "is_not",
			at_least: "at_least",
			at_most: "at_most",
		},
		number_compare_strict: {
			is: "is",
			at_least: "at_least",
			at_most: "at_most",
		},
		string_compare: {
			none: "none",
			is: "is",
			is_not: "is_not",
			contains: "contains",
			does_not_contain: "does_not_contain",
			starts_with: "starts_with",
			does_not_start_with: "does_not_start_with",
			ends_with: "ends_with",
			does_not_end_with: "does_not_end_with",
		},
		boolean: {
			true: "true",
			false: "false",
		},
		prereqs: {
			trait_prereq: "trait_prereq",
			attribute_prereq: "attribute_prereq",
			contained_quantity_prereq: "contained_quantity_prereq",
			contained_weight_prereq: "contained_weight_prereq",
			skill_prereq: "skill_prereq",
			spell_prereq: "spell_prereq",
		},
		spell_sub_type: {
			name: "name",
			tag: "tag",
			college: "college",
			college_count: "college_count",
			any: "any",
		},
		features: {
			attribute_bonus: "attribute_bonus",
			conditional_modifier: "conditional_modifier",
			dr_bonus: "dr_bonus",
			reaction_bonus: "reaction_bonus",
			skill_bonus: "skill_bonus",
			skill_point_bonus: "skill_point_bonus",
			spell_bonus: "spell_bonus",
			spell_point_bonus: "spell_point_bonus",
			weapon_bonus: "weapon_bonus",
			cost_reduction: "cost_reduction",
		},
		features_eqc: {
			contained_weight_reduction: "contained_weight_reduction",
		},
		st_limitation: {
			none: "none",
			striking_only: "striking_only",
			lifting_only: "lifting_only",
			throwing_only: "throwing_only",
		},
	},
};
// GURPSCONFIG.Item.documentClasses = {};
// GURPSCONFIG.Actor.documentClasses = {
// 	character: CharacterGURPS,
// };
export { GURPSCONFIG };
