import { BaseItemDataGURPS, BaseItemSourceGURPS, ContainerType, ItemSystemData } from "@item/data";
import { ContainerGURPS } from ".";

export type BaseContainerSource<
	TItemType extends ContainerType = ContainerType,
	TSystemData extends BaseContainerSystemData = BaseContainerSystemData,
> = BaseItemSourceGURPS<ContainerType, BaseContainerSystemData>;

export class BaseContainerData<
	TItem extends ContainerGURPS = ContainerGURPS,
	TSystemData extends BaseContainerSystemData = BaseContainerSystemData,
	//@ts-ignore
> extends BaseItemDataGURPS<TItem> {}

export interface BaseContainerSystemData extends ItemSystemData {
	open?: boolean;
}
