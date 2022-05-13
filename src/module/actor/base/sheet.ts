import { ItemGURPS } from "@item";
import { ItemDataBaseProperties } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData";
import { PropertiesToSource } from "@league-of-foundry-developers/foundry-vtt-types/src/types/helperTypes";

export class ActorSheetGURPS extends ActorSheet {
	/** @override */
	static get defaultOptions(): ActorSheet.Options {
		const options = super.defaultOptions;
		// options.dragDrop.push(
		// 	{ dragSelector: ".drag-handle" },
		// 	{ dragSelector: ".item[draggable=true]" },
		// 	{ dropSelector: ".item-list" },
		// 	{ dropSelector: ".item" },
		// );
		mergeObject(options, {
			classes: ["gcsga"],
		});
		return options;
	}

	/** @override */
	protected async _onDropItem(event: DragEvent, data: ActorSheet.DropData.Item): Promise<unknown> {
		if (!this.actor.isOwner) return false;

		console.log(data);

		//@ts-ignore
		const item = await ItemGURPS.implementation.fromDropData(data);
		// console.log(item);
		const itemData = item.toObject();
		// console.log(itemData);

		//Handle item sorting within the same Actor
		if (await this._isFromSameActor(data)) return this._onSortItem(event, itemData);

		// console.log(event);
		//@ts-ignore
		// console.log(event.target, $(event.target).closest(".item").data("parent-ids"));

		return super._onDropItem(event, data);
	}

	/** @override */
	protected _isFromSameActor(data: ActorSheet.DropData.Item): Promise<boolean> {
		// let other;
		// if (data.sceneId && data.tokenId) other = game.scenes.get(data.sceneId)?.tokens.get(data.tokenId)?this.actor;
		// if (!other && data.actorId) {
		// 	if (data.pack)
		// }
		return super._isFromSameActor(data);
	}

	/** @override */
	protected _onDragStart(event: DragEvent): void {
		const li = event.currentTarget;
		//@ts-ignore
		if (event.target.classList.contains("content-link")) return;

		// Create drag data
		const dragData = {
			actorId: this.actor.id,
			//@ts-ignore
			sceneId: this.actor.isToken ? canvas.scene?.id : null,
			//@ts-ignore
			tokenId: this.actor.isToken ? this.actor.token.id : null,
			pack: this.actor.pack,
		};

		// Owned Items
		//@ts-ignore
		if (li.dataset.itemId) {
			//@ts-ignore
			const item = this.actor.getDeepItem(li.dataset.parentIds.concat(li.dataset.itemId));
			//@ts-ignore
			dragData.type = "Item";
			//@ts-ignore
			dragData.data = item.data;
		}

		// Active Effect
		//@ts-ignore
		if (li.dataset.effectId) {
			//@ts-ignore
			const effect = this.actor.effects.get(li.dataset.effectId);
			//@ts-ignore
			dragData.type = "ActiveEffect";
			//@ts-ignore
			dragData.data = effect.data;
		}

		// Set data transfer
		event.dataTransfer?.setData("text/plain", JSON.stringify(dragData));
	}

	/** @override */
	protected _onSortItem(
		event: DragEvent,
		itemData: PropertiesToSource<ItemDataBaseProperties>,
	): Promise<Item[]> | undefined {
		console.log(itemData);
		//@ts-ignore
		const source = this.actor.getDeepItem(itemData.flags.gcsga.parents.concat(itemData._id));
		console.log(source);
		//@ts-ignore
		const siblings = this.actor.deepItems.filter((i) => {
			return i.data.type === source.data.type && i.data._id !== source.data._id;
		});
		console.log(siblings);

		// Get the drop target
		//@ts-ignore
		const dropTarget = event.target.closest("[data-item-id]");
		const targetId = dropTarget ? dropTarget.dataset.itemId : null;
		const target = siblings.find((s: Item) => s.data._id === targetId);

		// Ensure we are only sorting like-types
		if (target && source.data.type !== target.data.type) return;

		// Perform the sort
		const sortUpdates = SortingHelpers.performIntegerSort(source, { target: target, siblings });
		const updateData = sortUpdates.map((u) => {
			const update = u.update;
			//@ts-ignore
			update._id = u.target.data._id;
			return update;
		});

		// Perform the update
		//@ts-ignore
		if (itemData.flags.gcsga.parents.length > 1)
			//@ts-ignore
			return this.actor.getDeepItem(itemData.flags.gcsga.parents).updateEmbeddedDocuments("Item", updateData);
		//@ts-ignore
		return this.actor.updateEmbeddedDocuments("Item", updateData);
	}

	// protected override _onDragOver(event: DragEvent): void {
	// 	//@ts-ignore
	// 	const target = $(event.currentTarget);
	// 	//@ts-ignore
	// 	// console.log(target.parent());

	// 	//@ts-ignore
	// 	if (target.hasClass("item")) {
	// 		//@ts-ignore
	// 		target.addClass("redline");
	// 	}
	// }
	// 	//@ts-ignore
	// 	const $target = $(event.currentTarget);
	// 	//@ts-ignore
	// 	const $itemRef = $target.closest(".item");

	// 	//@ts-ignore
	// 	const targetElement = $target.get(0);
	// 	const previewElement = $itemRef.get(0);
	// 	if (previewElement && targetElement && targetElement !== previewElement) {
	// 		event.dataTransfer?.setDragImage(previewElement, 0, 0);
	// 		//@ts-ignore
	// 		mergeObject(targetElement.dataset, previewElement.dataset);
	// 	}
	// }
}
