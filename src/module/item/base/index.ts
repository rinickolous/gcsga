import { GURPSCONFIG as CONFIG } from "@module/config";
import { Context } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs";
import { ItemDataGURPS, ItemType } from "@item/data";
import { ActorGURPS, CharacterGURPS } from "@actor";
import { ContainerGURPS } from "@item";

export interface ItemConstructionContextGURPS extends Context<Actor | Item> {
	gcsga?: {
		ready?: boolean;
	};
}

class BaseItemGURPS extends Item {
	//@ts-ignore
	parent: ActorGURPS | ContainerGURPS | null = null;
	unsatisfied_reason = ""; // temporary

	constructor(data: ItemDataGURPS, context: ItemConstructionContextGURPS = {}) {
		if (!context.gcsga?.ready) {
			//@ts-ignore
			super(data, context);
		} else {
			mergeObject(context, {
				gcsga: {
					ready: true,
				},
			});
			const ItemConstructor = CONFIG.GURPS.Item.documentClasses[data.type as ItemType];
			return ItemConstructor ? new ItemConstructor(data, context) : new BaseItemGURPS(data, context);
		}
	}

	get actor(): CharacterGURPS | null {
		if (this.parent) return this.parent instanceof CharacterGURPS ? this.parent : this.parent.actor;
		return null;
	}

	get tags(): string[] {
		return this.data.data.tags;
	}

	get notes(): string {
		return this.data.data.notes;
	}
}

//@ts-ignore
interface BaseItemGURPS extends Item {
	parent: ActorGURPS | ContainerGURPS | null;
	readonly data: ItemDataGURPS;
}

export { BaseItemGURPS };
