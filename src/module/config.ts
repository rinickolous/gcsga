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
	ContainerGURPS,
	EquipmentContainerGURPS,
	EquipmentGURPS,
	EquipmentModifierContainerGURPS,
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
	TraitModifierContainerGURPS,
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
			container: ContainerGURPS,
			trait: TraitGURPS,
			trait_container: TraitContainerGURPS,
			modifier: TraitModifierGURPS,
			modifier_container: TraitModifierContainerGURPS,
			skill: SkillGURPS,
			technique: TechniqueGURPS,
			skill_container: SkillContainerGURPS,
			spell: SpellGURPS,
			ritual_magic_spell: RitualMagicSpellGURPS,
			spell_container: SpellContainerGURPS,
			equipment: EquipmentGURPS,
			equipment_container: EquipmentContainerGURPS,
			eqp_modifier: EquipmentModifierGURPS,
			eqp_modifier_container: EquipmentModifierContainerGURPS,
			note: NoteGURPS,
			note_container: NoteContainerGURPS,
		},
		allowedContents: {
			// character: ["trait", "trait_container", "skill", "technique", "skill_container", "spell", "ritual_magic_spell", "spell_container", "equipment", "equipment_container", "note", "note_container"],
			trait: ["modifier", "modifier_container"],
			trait_container: ["modifier", "modifier_container", "trait", "trait_container"],
			modifier_container: ["modifier", "modifier_container"],
			skill_container: ["skill", "technique", "skill_container"],
			spell_container: ["spell", "ritual_magic_spell", "spell_container"],
			equipment: ["eqp_modifier", "eqp_modifier_container"],
			equipment_container: ["equipment", "equipment_container", "eqp_modifier", "eqp_modifier_container"],
			eqp_modifier_container: ["eqp_modifier", "eqp_modifier_container"],
			note_container: ["note", "note_container"],
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
			none: "none",
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
		skill_bonus_selection_type: {
			skills_with_name: "skills_with_name",
			weapons_with_name: "weapons_with_name",
			this_weapon: "this_weapon",
		},
		weapon_bonus_selection_type: {
			weapons_with_required_skill: "weapons_with_required_skill",
			weapons_with_name: "weapons_with_name",
			this_weapon: "this_weapon",
		},
		spell_match: {
			all_colleges: "all_colleges",
			college_name: "college_name",
			power_source_name: "power_source_name",
			spell_name: "spell_name",
		},
		percentage: {
			5: "5",
			10: "10",
			15: "15",
			20: "20",
			25: "25",
			30: "30",
			35: "35",
			40: "40",
			45: "45",
			50: "50",
			55: "55",
			60: "60",
			65: "65",
			70: "70",
			75: "75",
			80: "80",
		},
		damage_st: {
			none: "none",
			thr: "thr",
			thr_leveled: "thr_leveled",
			sw: "sw",
			sw_leveled: "sw_leveled",
		},
		container_type: {
			group: "group",
			meta_trait: "meta_trait",
			race: "race",
			alternative_abilities: "alternative_abilities",
		},
	},
};
// GURPSCONFIG.Item.documentClasses = {};
// GURPSCONFIG.Actor.documentClasses = {
// 	character: CharacterGURPS,
// };
export { GURPSCONFIG };
