// import { ItemData, ItemDataBaseSource } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData";
import { ItemDataSource } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData";
// import { ItemData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs";
import { ItemGURPS } from ".";

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

export interface ItemFlagsGURPS extends Record<string, unknown> {
	gcsga?: {
		contentsData?: Array<ItemGURPS>;
		parents: Array<string>;
	};
}

export interface BaseItemSourceGURPS<
	TItemType extends ItemType = ItemType,
	TSystemData extends ItemSystemData = ItemSystemData,
> extends ItemDataSource {
	type: TItemType;
	data: TSystemData;
	flags: DeepPartial<ItemFlagsGURPS>;
}

export abstract class BaseItemDataGURPS<TItem extends ItemGURPS = ItemGURPS> extends foundry.data.ItemData {}

export interface BaseItemDataGURPS extends Omit<BaseItemSourceGURPS, "effects"> {
	type: ItemType;
	data: ItemSystemData;
	flags: ItemFlagsGURPS;
	//this should not be here
	modifiers: any;

	readonly _source: BaseItemSourceGURPS;
}

export interface ItemSystemData {
	id: string;
	name?: string;
	reference: string;
	notes: string;
	tags: Array<string>;
	type: ItemType;
}
