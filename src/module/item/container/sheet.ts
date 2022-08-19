import { ItemSheetGURPS } from "@item/base/sheet";
import { ItemGURPS } from "@item/data";
import { ItemDataBaseProperties } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData";
import { PropertiesToSource } from "@league-of-foundry-developers/foundry-vtt-types/src/types/helperTypes";
import { SYSTEM_NAME } from "@module/settings";
import { ContainerGURPS } from ".";

export class ContainerSheetGURPS extends ItemSheetGURPS {
	static get defaultOptions(): DocumentSheetOptions {
		return mergeObject(ItemSheetGURPS.defaultOptions, {
			template: `/systems/${SYSTEM_NAME}/templates/item/container-sheet.hbs`,
			dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }],
		});
	}

	get template(): string {
		return `/systems/${SYSTEM_NAME}/templates/item/container-sheet.hbs`;
	}

	activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html);
		// html.find(".item-list").on("dragend", event => this._onDrop(event));
	}

	// TODO fix
	protected _onDrop(event: DragEvent): any {
		event.preventDefault();
		event.stopPropagation();
		let data;
		try {
			data = JSON.parse(event.dataTransfer?.getData("text/plain") ?? "");
		} catch (err) {
			console.log(event.dataTransfer?.getData("text/plain"));
			console.log(err);
			return false;
		}
		// const item = this.item;

		switch (data.type) {
			case "Item":
				return this._onDropItem(event, data as ActorSheet.DropData.Item);
		}
	}

	// DragData handling
	protected async _onDropItem(event: DragEvent, data: ActorSheet.DropData.Item): Promise<unknown> {
		// Remove Drag Markers
		$(".drop-over").removeClass("drop-over");

		if (!this.item.isOwner) return false;

		// const item = await (BaseItemGURPS as any).implementation.fromDropData(data);
		const item = await (Item.implementation as any).fromDropData(data);
		const itemData = item.toObject();

		//Handle item sorting within the same Actor
		if (this.item.uuid === item.parent?.uuid) return this._onSortItem(event, itemData);

		return this._onDropItemCreate(itemData);
	}

	async _onDropItemCreate(itemData: Record<string, unknown> | Record<string, unknown>[]) {
		itemData = itemData instanceof Array ? itemData : [itemData];
		return (this.item as ContainerGURPS).createEmbeddedDocuments("Item", itemData, { temporary: false });
	}

	protected async _onSortItem(event: DragEvent, itemData: PropertiesToSource<ItemDataBaseProperties>): Promise<Item[]> {
		const source = (this.item as ContainerGURPS).deepItems.get(itemData._id!);
		const dropTarget = $(event.target!).closest("[data-item-id]");
		const target = (this.item as ContainerGURPS).deepItems.get(dropTarget.data("item-id"));
		if (!target) return [];
		const parent = target?.parent;
		const siblings = (target!.parent!.items as Collection<ItemGURPS>).filter(i => i._id !== source!._id && source!.sameSection(i));

		if (target && !source?.sameSection(target)) return [];

		const sortUpdates = SortingHelpers.performIntegerSort(source, { target: target, siblings });
		const updateData = sortUpdates.map(u => {
			const update = u.update;
			(update as any)._id = u.target!._id;
			return update;
		});

		if (source && target && source.parent != target.parent) {
			if (source instanceof ContainerGURPS && target.parents.includes(source)) return [];
			await source!.parent!.deleteEmbeddedDocuments("Item", [source!._id!], { render: false });
			return parent?.createEmbeddedDocuments(
				"Item",
				[
					{
						name: source.name,
						data: source.system,
						type: source.type,
						flags: source.flags,
						sort: updateData[0].sort,
					},
				],
				{ temporary: false },
			);
		}
		return parent!.updateEmbeddedDocuments("Item", updateData) as unknown as Item[];
	}
}
