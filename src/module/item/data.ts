import { ItemGURPS } from "@item";
import { EquipmentData, EquipmentSystemData } from "./equipment/data";
import { EquipmentContainerData, EquipmentContainerSystemData } from "./equipment_container/data";
import { EquipmentModifierData, EquipmentModifierSystemData } from "./equipment_modifier/data";
import { NoteData, NoteSystemData } from "./note/data";
import { NoteContainerData, NoteContainerSystemData } from "./note_container/data";
import { RitualMagicSpellData, RitualMagicSpellSystemData } from "./ritual_magic_spell/data";
import { SkillData, SkillSystemData } from "./skill/data";
import { SkillContainerData, SkillContainerSystemData } from "./skill_container/data";
import { SpellData, SpellSystemData } from "./spell/data";
import { SpellContainerSystemData } from "./spell_container/data";
import { TechniqueData, TechniqueSystemData } from "./technique/data";
import { TraitData, TraitSystemData } from "./trait/data";
import { TraitContainerData, TraitContainerSystemData } from "./trait_container/data";
import { TraitModifierData, TraitModifierSystemData } from "./trait_modifier/data";

export type ItemDataGURPS =
	| TraitData
	| TraitContainerData
	| TraitModifierData
	| SkillData
	| TechniqueData
	| SkillContainerData
	| SpellData
	| RitualMagicSpellData
	| SkillContainerData
	| EquipmentData
	| EquipmentModifierData
	| EquipmentContainerData
	| NoteData
	| NoteContainerData;

export type ItemSystemDataGURPS =
	| TraitSystemData
	| TraitContainerSystemData
	| TraitModifierSystemData
	| SkillSystemData
	| TechniqueSystemData
	| SkillContainerSystemData
	| SpellSystemData
	| RitualMagicSpellSystemData
	| SpellContainerSystemData
	| EquipmentSystemData
	| EquipmentModifierSystemData
	| EquipmentContainerSystemData
	| NoteSystemData
	| NoteContainerSystemData;

export type ItemType =
	| "trait"
	| "trait_container"
	| "modifier"
	| "modifier_container"
	| "skill"
	| "technique"
	| "skill_container"
	| "spell"
	| "ritual_magic_spell"
	| "spell_container"
	| "equipment"
	| "equipment_container"
	| "eqp_modifier"
	| "eqp_modifier_container"
	| "note"
	| "note_container";

// export type ContainerType =
// 	| "trait"
// 	| "trait_container"
// 	| "skill_container"
// 	| "spell_container"
// 	| "equipment"
// 	| "equipment_container"
// 	| "note_container";

export interface ItemFlagsGURPS extends Record<string, unknown> {
	gcsga?: {
		contentsData?: Array<ItemGURPS>;
	};
}

export interface BaseItemSystemData {
	id: string;
	name?: string;
	reference: string;
	notes: string;
	tags: Array<string>;
	type: ItemType;
}

export { ItemGURPS } from "@item";
export { EquipmentData } from "./equipment/data";
export { EquipmentContainerData } from "./equipment_container/data";
export { EquipmentModifierData } from "./equipment_modifier/data";
export { NoteData } from "./note/data";
export { NoteContainerData } from "./note_container/data";
export { RitualMagicSpellData } from "./ritual_magic_spell/data";
export { SkillData } from "./skill/data";
export { SkillContainerData } from "./skill_container/data";
export { SpellData } from "./spell/data";
export { TechniqueData } from "./technique/data";
export { TraitData } from "./trait/data";
export { TraitContainerData } from "./trait_container/data";
export { TraitModifierData } from "./trait_modifier/data";
