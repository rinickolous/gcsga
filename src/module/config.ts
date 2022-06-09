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
};
