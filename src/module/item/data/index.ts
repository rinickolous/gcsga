import { AdvantageData, AdvantageSource } from "@item/advantage/data";
import { AdvantageContainerData, AdvantageContainerSource } from "@item/advantage_container/data";
import { AdvantageModifierData, AdvantageModifierSource } from "@item/advantage_modifier/data";
import { EquipmentData, EquipmentSource } from "@item/equipment/data";
import { EquipmentContainerData, EquipmentContainerSource } from "@item/equipment_container/data";
import { EquipmentModifierData, EquipmentModifierSource } from "@item/equipment_modifier/data";
import { NoteData, NoteSource } from "@item/note/data";
import { NoteContainerData, NoteContainerSource } from "@item/note_container/data";
import { RitualMagicSpellData, RitualMagicSpellSource } from "@item/ritual_magic_spell/data";
import { SkillData, SkillSource } from "@item/skill/data";
import { SkillContainerData, SkillContainerSource } from "@item/skill_container/data";
import { SpellData, SpellSource } from "@item/spell/data";
import { SpellContainerData, SpellContainerSource } from "@item/spell_container/data";
import { TechniqueData, TechniqueSource } from "@item/technique/data";

export type ItemDataGURPS =
	| AdvantageData
	| AdvantageContainerData
	| AdvantageModifierData
	| SkillData
	| TechniqueData
	| SkillContainerData
	| SpellData
	| RitualMagicSpellData
	| SpellContainerData
	| EquipmentData
	| EquipmentModifierData
	| EquipmentContainerData
	| NoteData
	| NoteContainerData;

export type ItemSourceGURPS = ItemDataGURPS["_source"];

export type {
	AdvantageData,
	AdvantageModifierData,
	AdvantageContainerData,
	SkillData,
	TechniqueData,
	SkillContainerData,
	SpellData,
	RitualMagicSpellData,
	SpellContainerData,
	EquipmentData,
	EquipmentModifierData,
	EquipmentContainerData,
	NoteData,
	NoteContainerData,
};

export {
	AdvantageSource,
	AdvantageModifierSource,
	AdvantageContainerSource,
	SkillSource,
	TechniqueSource,
	SkillContainerSource,
	SpellSource,
	RitualMagicSpellSource,
	SpellContainerSource,
	EquipmentSource,
	EquipmentModifierSource,
	EquipmentContainerSource,
	NoteSource,
	NoteContainerSource,
};
