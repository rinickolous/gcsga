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

// const GURPSCONFIG: any = CONFIG;
const GURPSCONFIG: any = {
	Item: {
		documentClasses: {
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
};
// GURPSCONFIG.Item.documentClasses = {};
// GURPSCONFIG.Actor.documentClasses = {
// 	character: CharacterGURPS,
// };
export { GURPSCONFIG };
