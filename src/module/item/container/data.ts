import { BaseItemDataGURPS, BaseItemSourceGURPS, ItemSystemData } from "@item/base/data";
import { ItemType } from "@item/data";
import { ContainerGURPS } from ".";

export type BaseContainerSource<
	TItemType extends ItemType = ItemType,
	TSystemData extends BaseContainerSystemData = BaseContainerSystemData,
> = BaseItemSourceGURPS<ItemType, BaseContainerSystemData>;

export class BaseContainerData<
	TItem extends ContainerGURPS = ContainerGURPS,
	TSystemData extends BaseContainerSystemData = BaseContainerSystemData,
	//@ts-ignore
> extends BaseItemDataGURPS<TItem> {}

export interface BaseContainerSystemData extends ItemSystemData {
	open?: boolean;
}
