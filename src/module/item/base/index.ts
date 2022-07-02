import { Context } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs";
import { ItemDataGURPS, ItemType } from "@item/data";
import { ActorGURPS, CharacterGURPS } from "@actor";
import { ContainerGURPS } from "@item/container";

export interface ItemConstructionContextGURPS extends Context<Actor | Item> {
	gcsga?: {
		ready?: boolean;
	};
}

class BaseItemGURPS extends Item {
	//@ts-ignore
	parent: ActorGURPS | ContainerGURPS | null;
	unsatisfied_reason: string;

	constructor(data: ItemDataGURPS | any, context: Context<Actor> & ItemConstructionContextGURPS = {}) {
		if (context.gcsga?.ready) {
			super(data, context);
			this.unsatisfied_reason = "";
		} else {
			mergeObject(context, {
				gcsga: {
					ready: true,
				},
			});
			const ItemConstructor = (CONFIG as any).GURPS.Item.documentClasses[data.type as ItemType];
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

	get reference(): string {
		return this.data.data.reference;
	}

	get parentCount(): number {
		let i = 0;
		let p: any = this.parent;
		while (p) {
			i++;
			p = p.parent;
		}
		return i;
	}
}

//@ts-ignore
interface BaseItemGURPS extends Item {
	parent: ActorGURPS | ContainerGURPS | null;
	unsatisfied_reason: string;
	readonly data: ItemDataGURPS;
}

export { BaseItemGURPS };
