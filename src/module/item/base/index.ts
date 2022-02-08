import { ItemDataGURPS } from "@item/data";
import { ActorGURPS } from "@actor";
import { ContainerGURPS } from "@item";
import { Context } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs";
import { ItemType } from "./data";
import { documents } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/module.mjs";

export interface ItemConstructionContextGURPS extends Context<Actor | Item> {
	gcsga?: {
		ready?: boolean;
	};
}

//@ts-ignore
export class ItemGURPS extends Item {
	private initialized?: boolean | undefined;
	// readonly parent!: ActorGURPS | ContainerGURPS | null;

	/** @override */
	constructor(data: ItemDataGURPS, context: ItemConstructionContextGURPS = {}) {
		if (context.gcsga?.ready) {
			//@ts-ignore
			super(data, context);
			this.initialized = true;
		} else {
			mergeObject(context, { gcsga: { ready: true } });
			//@ts-ignore
			const ItemConstructor = CONFIG.GURPS.Item.documentClasses[data.type as ItemType];
			return ItemConstructor ? new ItemConstructor(data, context) : new ItemGURPS(data, context);
		}
	}

	/**
	 * @override update function to account for Items contained intside ofther Items.
	 * @param data Differential update data which modifies the existing values of this document data
	 * @param context Additional context which customizes the update workflow
	 * @returns The updated document instance
	 */
	async update(data: Record<string, unknown>, context?: DocumentModificationContext): Promise<this | undefined> {
		if (!(this.parent instanceof Item)) return super.update(data, context);
		data = foundry.utils.expandObject(data);
		data._id = this.id;
		await this.parent.updateEmbeddedDocuments("Item", [data]);
		this.render(false);
	}

	async delete(context?: DocumentModificationContext): Promise<this | undefined> {
		// if (!(this.parent instanceof Item)) return super.delete(context);
		//@ts-ignore
		if (this.parent instanceof ContainerGURPS) return this.parent.deleteEmbeddedDocuments("Item", [this.id]);
		return super.delete(context);
		// return this.parent.deleteEmbeddedDocuments("Item", [this.id]);
	}

	getData() {
		return this.data.data;
	}

	async _preUpdate(changed: any, options: object, user: documents.BaseUser) {
		console.log(changed);
		if (typeof changed.data.categories == "string") {
			changed.data.categories = changed.data.categories.length ? changed.data.categories.split(/,\s*/) : [];
		}
	}
}

//@ts-ignore
export interface ItemGURPS {
	readonly data: ItemDataGURPS;
	readonly parent: ActorGURPS | ContainerGURPS | null;
}

// export { ItemGURPS };
