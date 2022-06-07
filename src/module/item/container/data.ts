import { ItemGURPS } from "@item";
import { BaseItemDataGURPS, BaseItemSourceGURPS, ItemSystemData } from "@item/base/data";
import { ItemDataGURPS } from "@item/data";
import { ContainerGURPS } from ".";

export type ContainerType =
	| "trait"
	| "trait_container"
	| "skill_container"
	| "spell_container"
	| "equipment"
	| "equipment_container"
	| "note_container";

export type BaseContainerSource<
	TItemType extends ContainerType = ContainerType,
	TSystemData extends BaseContainerSystemData = BaseContainerSystemData,
> = BaseItemSourceGURPS<ContainerType, BaseContainerSystemData>;

//@ts-ignore
export class BaseContainerData<
	TItem extends ContainerGURPS = ContainerGURPS,
	TSystemData extends BaseContainerSystemData = BaseContainerSystemData,
	//@ts-ignore
> extends BaseItemDataGURPS<TItem> {}

//@ts-ignore
export interface BaseContainerData<TItem extends ContainerGURPS = ContainerGURPS>
	extends Omit<BaseContainerSource, "effects" | "flags" | "items"> {
	type: BaseContainerSource["type"];
	data: BaseContainerSource["data"];
	items: foundry.utils.Collection<ItemGURPS>;
	children: Array<ItemDataGURPS>;

	readonly document: TItem;
	readonly _source: BaseContainerSource;
}

export interface BaseContainerSystemData extends ItemSystemData {
	open?: boolean;
	children: Array<any>;
}
