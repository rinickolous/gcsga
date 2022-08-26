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
		allowedContents: {
			character: ["trait", "trait_container", "skill", "technique", "skill_container", "spell", "ritual_magic_spell", "spell_container", "equipment", "equipment_container", "note", "note_container"],
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
			0: "gcsga.select.cr_level.0",
			6: "gcsga.select.cr_level.6",
			9: "gcsga.select.cr_level.9",
			12: "gcsga.select.cr_level.12",
			15: "gcsga.select.cr_level.15",
		},
		cr_adj: {
			none: "gcsga.select.cr_adj.none",
			action_penalty: "gcsga.select.cr_adj.action_penalty",
			reaction_penalty: "gcsga.select.cr_adj.reaction_penalty",
			fright_check_penalty: "gcsga.select.cr_adj.fright_check_penalty",
			fright_check_bonus: "gcsga.select.cr_adj.fright_check_bonus",
			minor_cost_of_living_increase: "gcsga.select.cr_adj.minor_cost_of_living_increase",
			major_cost_of_living_increase: "gcsga.select.cr_adj.major_cost_of_living_increase",
		},
		number_compare: {
			none: "gcsga.select.number_compare.none",
			is: "gcsga.select.number_compare.is",
			is_not: "gcsga.select.number_compare.is_not",
			at_least: "gcsga.select.number_compare.at_least",
			at_most: "gcsga.select.number_compare.at_most",
		},
		number_compare_strict: {
			is: "gcsga.select.number_compare_strict.is",
			at_least: "gcsga.select.number_compare_strict.at_least",
			at_most: "gcsga.select.number_compare_strict.at_most",
		},
		string_compare: {
			none: "gcsga.select.string_compare.none",
			is: "gcsga.select.string_compare.is",
			is_not: "gcsga.select.string_compare.is_not",
			contains: "gcsga.select.string_compare.contains",
			does_not_contain: "gcsga.select.string_compare.does_not_contain",
			starts_with: "gcsga.select.string_compare.starts_with",
			does_not_start_with: "gcsga.select.string_compare.does_not_start_with",
			ends_with: "gcsga.select.string_compare.ends_with",
			does_not_end_with: "gcsga.select.string_compare.does_not_end_with",
		},
		has: {
			true: "gcsga.select.has.true",
			false: "gcsga.select.has.false",
		},
		prereqs: {
			trait_prereq: "gcsga.select.prereqs.trait_prereq",
			attribute_prereq: "gcsga.select.prereqs.attribute_prereq",
			contained_quantity_prereq: "gcsga.select.prereqs.contained_quantity_prereq",
			contained_weight_prereq: "gcsga.select.prereqs.contained_weight_prereq",
			skill_prereq: "gcsga.select.prereqs.skill_prereq",
			spell_prereq: "gcsga.select.prereqs.spell_prereq",
		},
		spell_sub_type: {
			name: "gcsga.select.spell_sub_types.name",
			tag: "gcsga.select.spell_sub_types.tag",
			college: "gcsga.select.spell_sub_types.college",
			college_count: "gcsga.select.spell_sub_types.college_count",
			any: "gcsga.select.spell_sub_types.any",
		},
		features: {
			attribute_bonus: "gcsga.select.features.attribute_bonus",
			conditional_modifier: "gcsga.select.features.conditional_modifier",
			dr_bonus: "gcsga.select.features.dr_bonus",
			reaction_bonus: "gcsga.select.features.reaction_bonus",
			skill_bonus: "gcsga.select.features.skill_bonus",
			skill_point_bonus: "gcsga.select.features.skill_point_bonus",
			spell_bonus: "gcsga.select.features.spell_bonus",
			spell_point_bonus: "gcsga.select.features.spell_point_bonus",
			weapon_bonus: "gcsga.select.features.weapon_bonus",
			cost_reduction: "gcsga.select.features.cost_reduction",
		},
		features_eqc: {
			contained_weight_reduction: "gcsga.select.features.contained_weight_reduction",
		},
		st_limitation: {
			none: "gcsga.select.st_limitation.none",
			striking_only: "gcsga.select.st_limitation.striking_only",
			lifting_only: "gcsga.select.st_limitation.lifting_only",
			throwing_only: "gcsga.select.st_limitation.throwing_only",
		},
		skill_bonus_selection_type: {
			skills_with_name: "gcsga.select.skill_bonus_selection_type.skills_with_name",
			weapons_with_name: "gcsga.select.skill_bonus_selection_type.weapons_with_name",
			this_weapon: "gcsga.select.skill_bonus_selection_type.this_weapon",
		},
		weapon_bonus_selection_type: {
			weapons_with_required_skill: "gcsga.select.weapon_bonus_selection_type.weapons_with_required_skill",
			weapons_with_name: "gcsga.select.weapon_bonus_selection_type.weapons_with_name",
			this_weapon: "gcsga.select.weapon_bonus_selection_type.this_weapon",
		},
		spell_match: {
			all_colleges: "gcsga.select.spell_match.all_colleges",
			college_name: "gcsga.select.spell_match.college_name",
			power_source_name: "gcsga.select.spell_match.power_source_name",
			spell_name: "gcsga.select.spell_match.spell_name",
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
			none: "gcsga.select.damage_st.none",
			thr: "gcsga.select.damage_st.thr",
			thr_leveled: "gcsga.select.damage_st.thr_leveled",
			sw: "gcsga.select.damage_st.sw",
			sw_leveled: "gcsga.select.damage_st.sw_leveled",
		},
		container_type: {
			group: "gcsga.select.container_type.group",
			meta_trait: "gcsga.select.container_type.meta_trait",
			race: "gcsga.select.container_type.race",
			alternative_abilities: "gcsga.select.container_type.alternative_abilities",
		},
		difficulty: {
			e: "gcsga.select.difficulty.easy",
			a: "gcsga.select.difficulty.average",
			h: "gcsga.select.difficulty.hard",
			vh: "gcsga.select.difficulty.very_hard",
			w: "gcsga.select.difficulty.wildcard",
		},
		trait_mod_cost_type: {
			percentage_leveled: "gcsga.select.trait_mod_cost_type.percentage_leveled",
			percentage: "gcsga.select.trait_mod_cost_type.percentage",
			points: "gcsga.select.trait_mod_cost_type.points",
			multiplier: "gcsga.select.trait_mod_cost_type.multiplier",
		},
		trait_mod_affects: {
			total: "gcsga.select.trait_mod_affects.total",
			base_only: "gcsga.select.trait_mod_affects.base_only",
			levels_only: "gcsga.select.trait_mod_affects.levels_only",
		},
		eqp_mod_cost_type: {
			to_original_cost: "gcsga.select.eqp_mod_cost_type.to_original_cost",
			to_base_cost: "gcsga.select.eqp_mod_cost_type.to_base_cost",
			to_final_base_cost: "gcsga.select.eqp_mod_cost_type.to_final_base_cost",
			to_final_cost: "gcsga.select.eqp_mod_cost_type.to_final_cost",
		},
		eqp_mod_weight_type: {
			to_original_weight: "gcsga.select.eqp_mod_weight_type.to_original_weight",
			to_base_weight: "gcsga.select.eqp_mod_weight_type.to_base_weight",
			to_final_base_weight: "gcsga.select.eqp_mod_weight_type.to_final_base_weight",
			to_final_weight: "gcsga.select.eqp_mod_weight_type.to_final_weight",
		},
	},
};
// GURPSCONFIG.Item.documentClasses = {};
// GURPSCONFIG.Actor.documentClasses = {
// 	character: CharacterGURPS,
// };
export { GURPSCONFIG };
