import { CharacterGURPS } from "@actor";
import {
	TraitGURPS,
	TraitContainerGURPS,
	SkillGURPS,
	TechniqueGURPS,
	SkillContainerGURPS,
	SpellGURPS,
	RitualMagicSpellGURPS,
	SpellContainerGURPS,
	EquipmentGURPS,
	EquipmentModifierGURPS,
	EquipmentContainerGURPS,
	NoteGURPS,
	NoteContainerGURPS,
	TraitModifierGURPS,
} from "@item";

export const GURPSCONFIG = {
	SYSTEM_NAME: "gcsga",
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
			eqp_modifier: EquipmentModifierGURPS,
			equipment_container: EquipmentContainerGURPS,
			note: NoteGURPS,
			note_container: NoteContainerGURPS,
		},
		containerContents: {
			trait: ["modifier"],
			trait_container: ["trait", "trait_container", "modifier"],
			skill_container: ["skill", "technique", "skill_container"],
			spell_container: ["spell", "ritual_magic_spell", "spell_container"],
			equipment: ["eqp_modifier"],
			equipment_container: ["equipment", "eqp_modifier", "equipment_container"],
			note_container: ["note", "note_container"],
		},
	},
	Actor: {
		documentClasses: {
			character: CharacterGURPS,
		},
		weightUnits: {
			oz: {
				label: "oz",
				multiplier: 0.45359237 / 16,
				multiplier_simple: 0.03,
			},
			lb: {
				label: "lb",
				multiplier: 0.45359237,
				multiplier_simple: 0.5,
			},
			tn: {
				label: "tn",
				multiplier: 0.45359237 * 2000,
				multiplier_simple: 1000,
			},
			lt: {
				label: "lt",
				multiplier: 0.45359237 * 2240,
				multiplier_simple: 1120,
			},
			t: {
				label: "t",
				multiplier: 1000,
				multiplier_simple: 1120,
			},
			kg: {
				label: "kg",
				multiplier: 1,
				multiplier_simple: 1,
			},
			g: {
				label: "g",
				multiplier: 0.001,
				multiplier_simple: 0.001,
			},
		},
	},
	select: {
		prereqs: {
			when_tl: {
				none: "gcsga.select.prereqs.when_tl.none",
				is: "gcsga.select.prereqs.when_tl.is",
				is_not: "gcsga.select.prereqs.when_tl.is_not",
				at_least: "gcsga.select.prereqs.when_tl.at_least",
				at_most: "gcsga.select.prereqs.when_tl.at_most",
			},
			all: {
				true: "gcsga.select.prereqs.all.true",
				false: "gcsga.select.prereqs.all.false",
			},
			has: {
				true: "gcsga.select.prereqs.has.true",
				false: "gcsga.select.prereqs.has.false",
			},
			quantity: {
				is: "gcsga.select.prereqs.quantity.is",
				at_least: "gcsga.select.prererqs.quantity.at_leat",
				at_most: "gcsga.select.prereqs.quantity.at_most",
			},
			type: {
				trait_prereq: "gcsga.select.prereqs.type.trait_prereq",
				attribute_prereq: "gcsga.select.prereqs.type.attribute_prereq",
				contained_quantity_prereq: "gcsga.select.prereqs.type.contained_quantity_prereq",
				contained_weight_prereq: "gcsga.select.prereqs.type.contained_weight_prereq",
				skill_prereq: "gcsga.select.prereqs.type.skill_prereq",
				spell_prereq: "gcsga.select.prereqs.type.spell_prereq",
			},
		},
	},
};
