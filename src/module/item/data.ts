import { ItemGURPS } from "@item";
import { EquipmentData } from "./equipment/data";
import { EquipmentContainerData } from "./equipment_container/data";
import { EquipmentModifierData } from "./equipment_modifier/data";
import { RitualMagicSpellData } from "./ritual_magic_spell/data";
import { SkillData } from "./skill/data";
import { SkillContainerData } from "./skill_container/data";
import { SpellData } from "./spell/data";
import { TraitData } from "./trait/data";
import { TraitContainerData } from "./trait_container/data";
import { TraitModifierData } from "./trait_modifier/data";

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

export type ItemType =
	| "trait"
	| "trait_container"
	| "modifier"
	| "skill"
	| "technique"
	| "skill_container"
	| "spell"
	| "ritual_magic_spell"
	| "spell_container"
	| "equipment"
	| "eqp_modifier"
	| "equipment_container"
	| "note"
	| "note_container";

export type ContainerType =
	| "trait"
	| "trait_container"
	| "skill_container"
	| "spell_container"
	| "equipment"
	| "equipment_container"
	| "note_container";

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
