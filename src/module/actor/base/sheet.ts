import { ActorGURPS } from "@actor";
import { BaseItemGURPS, ContainerGURPS, ItemGURPS } from "@item";
import { ItemDataBaseProperties } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData";
import { PropertiesToSource } from "@league-of-foundry-developers/foundry-vtt-types/src/types/helperTypes";
import { SYSTEM_NAME } from "@module/settings";

export class ActorSheetGURPS extends ActorSheet {
	static override get defaultOptions(): ActorSheet.Options {
		const options = ActorSheet.defaultOptions;
		mergeObject(options, {
			classes: ["gcsga", "actor"],
		});
		return options;
	}

	// DragData handling
	protected override async _onDropItem(event: DragEvent, data: ActorSheet.DropData.Item): Promise<unknown> {
		if (!this.actor.isOwner) return false;

		const item = await (BaseItemGURPS as any).implementation.fromDropData(data);
		const itemData = item.toObject();

		//Handle item sorting within the same Actor
		if (await this._isFromSameActor(data)) return this._onSortItem(event, itemData);

		return this._onDropItemCreate(itemData);
	}

	protected override async _onDragStart(event: DragEvent): Promise<void> {
		const list = event.currentTarget;
		// if (event.target.classList.contains("contents-link")) return;

		const dragData: any = {
			actorId: this.actor.id,
			sceneId: this.actor.isToken ? canvas?.scene?.id : null,
			tokenId: this.actor.isToken ? this.actor.token?.id : null,
			pack: this.actor?.pack,
		};

		// Owned Items
		if ((list as HTMLElement).dataset.itemId) {
			const item = this.actor.deepItems.get((list as HTMLElement).dataset.itemId!);
			dragData.type = "Item";
			dragData.data = item?.data;

			// Create custom drag image
			const dragImage = document.createElement("div");
			dragImage.innerHTML = await renderTemplate(`systems/${SYSTEM_NAME}/templates/actor/drag-image.hbs`, {
				name: `${dragData.data.name}`,
				type: `--shape-gcs-${dragData.data.type.replace("_container", "").replace("_", "-")}`,
			});
			dragImage.id = "drag-ghost";
			document.body.querySelectorAll("#drag-ghost").forEach(e => e.remove());
			document.body.appendChild(dragImage);
			const height = (document.body.querySelector("#drag-ghost") as HTMLElement).offsetHeight;
			event.dataTransfer?.setDragImage(dragImage, 0, height / 2);
		}

		// Active Effect
		if ((list as HTMLElement).dataset.effectId) {
			const effect = this.actor.effects.get((list as HTMLElement).dataset.effectId!);
			dragData.type = "ActiveEffect";
			dragData.data = effect?.data;
		}

		// Set data transfer
		event.dataTransfer?.setData("text/plain", JSON.stringify(dragData));
	}

	protected override async _onSortItem(
		event: DragEvent,
		itemData: PropertiesToSource<ItemDataBaseProperties>,
	): Promise<Item[]> {
		const source = this.actor.deepItems.get(itemData._id!);
		const dropTarget = $(event.target!).closest("[data-item-id]");
		const target = this.actor.deepItems.get(dropTarget.data("item-id"));
		const siblings = (target!.parent!.items as Collection<ItemGURPS>).filter(
			i => i.data._id !== source!.data._id && source!.sameSection(i),
		);

		if (target && !source?.sameSection(target)) return [];

		const sortUpdates = SortingHelpers.performIntegerSort(source, { target: target, siblings });
		const updateData = sortUpdates.map(u => {
			const update = u.update;
			(update as any)._id = u.target!.data._id;
			return update;
		});

		const parent = target!.parent;
		if (source && target && source.parent != target.parent) {
			if (source instanceof ContainerGURPS && target.parents.includes(source)) return [];
			await source!.parent!.deleteEmbeddedDocuments("Item", [source!.data._id!], { render: false });
			return parent?.createEmbeddedDocuments(
				"Item",
				[
					{
						name: source.data.name,
						data: source.data.data,
						type: source.data.type,
						flags: source.data.flags,
						sort: updateData[0].sort,
					},
				],
				{ temporary: false },
			);
		}
		return parent!.updateEmbeddedDocuments("Item", updateData) as unknown as Item[];
	}
}

export interface ActorSheetGURPS extends ActorSheet {
	object: ActorGURPS;
}
