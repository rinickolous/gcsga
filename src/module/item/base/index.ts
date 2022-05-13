import { ItemDataGURPS } from "@item/data";
import { ActorGURPS } from "@actor";
import { ContainerGURPS } from "@item";
import { Context, DocumentModificationOptions } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs";
import { ItemType } from "./data";
import { documents } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/module.mjs";
import { DropData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/foundry.js/clientDocumentMixin";
import {
	DocumentConstructor,
	ConfiguredDocumentClass,
	PropertiesToSource,
} from "@league-of-foundry-developers/foundry-vtt-types/src/types/helperTypes";
import { ItemDataBaseProperties } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData";

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
		// console.log("initializing item", data, context);
		if (context.gcsga?.ready) {
			//@ts-ignore
			super(data, context);
			this.initialized = true;
		} else {
			// console.log(context.parent);
			// console.log(context.parent?.toObject(false));
			// console.log(data.name, context.parent instanceof ActorGURPS);
			// let parents: string | null = null;
			// if (context.parent instanceof ItemGURPS)
			// 	parents = context.parent.getFlag("gcsga", "parents") + " " + context.parent.id;
			// else if (context.parent instanceof ActorGURPS) parents = "actor";
			mergeObject(context, {
				gcsga: {
					ready: true,
				},
			});
			// console.log(data, data.flags, context, context.gcsga);
			// mergeObject(data, { flags: { gcsga: context.gcsga } });
			// console.log(data, context);
			//@ts-ignore
			const ItemConstructor = CONFIG.GURPS.Item.documentClasses[data.type as ItemType];
			return ItemConstructor ? new ItemConstructor(data, context) : new ItemGURPS(data, context);
		}
	}

	protected _onCreate(
		data: PropertiesToSource<ItemDataBaseProperties>,
		options: DocumentModificationOptions,
		userId: string,
	): void {
		console.log(data, options, userId);
		return super._onCreate(data, options, userId);
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

	/** @override */
	static async fromDropData<T extends DocumentConstructor>(
		this: T,
		data: DropData<InstanceType<T>>,
		//@ts-ignore
		options?: FromDropDataOptions | undefined,
	): Promise<InstanceType<ConfiguredDocumentClass<T>> | undefined> {
		// console.log("precheck", data, options);
		//@ts-ignore
		if (data.type !== this.documentName) return null;
		// @ts-ignore
		const collection = CONFIG[this.documentName].collection.instance;
		let document = null;

		// Case 1 - Data explicitly provided
		//@ts-ignore
		if (data.data) {
			//@ts-ignore
			document = options?.importWorld ? await this.create(data.data) : new this(data.data);
		}

		// Case 2 - Import from a Compendium pack
		//@ts-ignore
		else if (data.pack) {
			//@ts-ignore
			const pack = game.packs.get(data.pack);
			//@ts-ignore
			if (pack.documentName !== this.documentName) return null;
			document = options?.importWorld //@ts-ignore
				? await collection.importFromCompendium(pack, data.id) //@ts-ignore
				: await pack.getDocument(data.id);
		}

		// Case 3 - Import from World document
		//@ts-ignore
		else document = collection.get(data.id);

		// Flag the source GUID
		if (document && !document.getFlag("core", "sourceId")) {
			document.data.update({ "flags.core.sourceId": document.uuid });
			document.prepareData();
		}
		// console.log("checkem", document);
		return document;
	}

	getData() {
		return this.data.data;
	}

	async _preUpdate(changed: any, options: object, user: documents.BaseUser) {
		console.log(this);
		console.log(changed);
		if (!!changed.data?.categories && typeof changed?.data?.categories == "string") {
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
