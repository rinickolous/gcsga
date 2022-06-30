import { ActorGURPS } from "@actor";
import { BaseItemGURPS } from "@item";
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

		//@ts-ignore
		const item = await BaseItemGURPS.implementation.fromDropData(data);
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
			document.body.querySelectorAll("#drag-ghost").forEach((e) => e.remove());
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
}

export interface ActorSheetGURPS extends ActorSheet {
	object: ActorGURPS;
}
