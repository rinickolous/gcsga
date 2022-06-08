import { ItemGURPS } from "@item";
import { ItemDataBaseProperties } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData";
import { PropertiesToSource } from "@league-of-foundry-developers/foundry-vtt-types/src/types/helperTypes";
import { ActorGURPS } from ".";

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
			classes: ["gcsga", "actor"],
		});
		return options;
	}

	/** @override */
	protected async _onDropItem(event: DragEvent, data: ActorSheet.DropData.Item): Promise<unknown> {
		if (!this.actor.isOwner) return false;

		//@ts-ignore
		const item = await ItemGURPS.implementation.fromDropData(data);
		const itemData = item.toObject();

		//Handle item sorting within the same Actor
		if (await this._isFromSameActor(data)) return this._onSortItem(event, itemData);

		return this._onDropItemCreate(itemData);
	}

	/** @override */
	protected _isFromSameActor(data: ActorSheet.DropData.Item): Promise<boolean> {
		return super._isFromSameActor(data);
	}

	/** @override */
	protected _onDragStart(event: DragEvent): void {
		const li = event.currentTarget;
		//@ts-ignore
		if (event.target.classList.contains("content-link")) return;

		// Create drag data
		const dragData: any = {
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
			const item = this.actor.deepItems.get(li.dataset.itemId);
			dragData.type = "Item";
			dragData.data = item.data;

			// Create custom drag image
			const drag_image = document.createElement("div");
			drag_image.id = "drag-ghost";
			drag_image.textContent = dragData.data.name;
			drag_image.style.position = "absolute";
			drag_image.style.top = "-1000px";
			document.body.appendChild(drag_image);
			event.dataTransfer?.setDragImage(drag_image, 0, 0);
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
	//@ts-ignore
	protected async _onSortItem(
		event: DragEvent,
		itemData: PropertiesToSource<ItemDataBaseProperties>,
	): Promise<Item[] | undefined> {
		// console.log(event, itemData);
		//@ts-ignore
		const source = this.actor.deepItems.get(itemData._id);
		//@ts-ignore
		const dropTarget = event.target.closest("[data-item-id]");
		//@ts-ignore
		const target = this.actor.deepItems.get(dropTarget.dataset.itemId);
		//@ts-ignore
		const siblings = target.parent.items.filter((i) => {
			return source.sameSection(i) && i.data._id !== source.data._id;
		});

		// Ensure we are only sorting like-types
		if (target && !source.sameSection(target)) return;

		// Perform the sort
		const sortUpdates = SortingHelpers.performIntegerSort(source, { target: target, siblings });
		const updateData = sortUpdates.map((u) => {
			const update = u.update;
			//@ts-ignore
			update._id = u.target.data._id;
			return update;
		});
		const parent = target.parent;
		if (source.parent != target.parent) {
			if (target.data.flags.gcsga.parents.includes(source.id)) return;
			const sourceData = duplicate(source.data.toObject());
			await source.parent.deleteEmbeddedDocuments("Item", [source.data._id], { render: false });
			//@ts-ignore
			console.log("CREATE", sourceData);
			return parent.createEmbeddedDocuments("Item", [
				{
					name: sourceData.name,
					data: sourceData.data,
					type: sourceData.type,
					flags: sourceData.flags,
					sort: updateData[0].sort,
				},
			]);
		}

		// Perform the update
		return parent.updateEmbeddedDocuments("Item", updateData);
	}

	protected _getHeaderButtons(): Application.HeaderButton[] {
		const buttons = super._getHeaderButtons();
		const sheetButton = buttons.find((button) => button.class === "configure-sheet");
		//@ts-ignore
		const hasMultipleSheets = Object.keys(CONFIG.Actor.sheetClasses[this.actor.type]).length > 1;
		if (!hasMultipleSheets && sheetButton) {
			buttons.splice(buttons.indexOf(sheetButton), 1);
		}
		return buttons;
	}
}
