import { ItemDataGURPS } from "@item/data";
import { ItemDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData";
import { ItemGURPS } from "@item/base";
import { BaseContainerData } from "./data";

export abstract class ContainerGURPS extends ItemGURPS {
	// items: EmbeddedCollection<ItemDataGURPS, any> = new EmbeddedCollection(this.data, [], ItemGURPS);
	// items: any;
	items: foundry.utils.Collection<ItemGURPS> = new foundry.utils.Collection();

	/**
	 * @override
	 * @param embeddedName The name of the embedded Document type
	 * @param data An array of data objects used to create multiple documents
	 * @param context Additional context which customizes the creation workflow
	 * @returns null      */
	//@ts-ignore
	async createEmbeddedDocuments(
		embeddedName: string,
		data: Array<Record<string, unknown>>,
		context: DocumentModificationContext = {},
	): Promise<Array<foundry.abstract.Document<any, any>> | undefined> {
		if (!Array.isArray(data)) data = [data];
		const currentItems = duplicate(getProperty(this, "data.flags.gcsga.contentsData") ?? []);
		const createdItems = [];
		if (data.length) {
			for (const itemData of data) {
				let theData = itemData;
				theData._id = randomID();
				//@ts-ignore
				theData = new CONFIG.Item.documentClass(theData as ItemDataConstructorData, { parent: this }).toJSON();
				currentItems.push(theData);
				createdItems.push(theData);
			}
			if (this.parent)
				return this.parent.updateEmbeddedDocuments(embeddedName, [
					{ _id: this.id, "flags.gcsga.contentsData": currentItems },
				]);
			else this.setCollection(this, currentItems);
		}
	}

	/**
	 * @override
	 * @param embeddedName The name of the embedded Document type
	 * @param id The id of the child document to retrieve
	 * @param options Additional options which modify hoe wmbedded documents are retrieved
	 * @param strict Throw an Error if the requested id does not exist. @see {Collection.get}
	 *               (default: "false")
	 * @returns the retrieved embedded Document instance, or undefined
	 */
	getEmbeddedDocument(
		embeddedName: string,
		id: string,
		options: { strict?: boolean | undefined } | undefined,
	): foundry.abstract.Document<any, any> | undefined {
		if (embeddedName !== "Item") return super.getEmbeddedDocument(embeddedName, id, options);
		return this.items.get(id);
	}

	/**
	 * @override
	 * @param embeddedName The name of the embedded Document type
	 * @param updates An array of differential data objects, each used to update a single Document
	 * @param context Additional context which customized the update workflow
	 */
	async updateEmbeddedDocuments(
		embeddedName: string,
		updates?: Array<Record<string, unknown>>,
		context?: DocumentModificationContext,
	): Promise<Array<foundry.abstract.Document<any, any>>> {
		if (embeddedName !== "Item") return super.updateEmbeddedDocuments(embeddedName, updates, context);
		const containedItems = getProperty(this, "data.flags.gcsga.contentsData") ?? [];
		if (!Array.isArray(updates)) updates = updates ? [updates] : [];
		const updatedItems: Array<any> = [];
		const newContainedItems = containedItems.map((existing: { _id: string }) => {
			const theUpdate = updates?.find((update) => update._id === existing._id);
			if (theUpdate) {
				const newData = mergeObject(theUpdate, existing, {
					overwrite: false,
					insertKeys: true,
					insertValues: true,
					inplace: false,
				});
				updatedItems.push(newData);
				return newData;
			}
			return existing;
		});

		if (updatedItems.length) {
			if (this.parent)
				await this.parent.updateEmbeddedDocuments("Item", [
					{ _id: this.id, "flags.gcsga.contentsData": newContainedItems },
				]);
			else await this.setCollection(this, newContainedItems);
		}
		return updatedItems;
	}

	/**
	 * @override
	 * @param embeddedName The name of the embedded Document type
	 * @param ids An array of string ids for each Document to be deleted
	 * @param context Additional context which customized the deletion workflor
	 * @returns An array of deleted Document instances
	 */
	async deleteEmbeddedDocuments(
		embeddedName: string,
		ids: Array<string>,
		context?: DocumentModificationContext,
	): Promise<Array<foundry.abstract.Document<any, any>>> {
		if (embeddedName !== "Item") return super.deleteEmbeddedDocuments(embeddedName, ids, context);
		const containedItems = getProperty(this, "data.flags.gcsga.contentsData") ?? [];
		//@ts-ignore itemData._id
		const newContainedItems = containedItems.filter((itemData: ItemDataGURPS) => !ids.includes(itemData._id));
		const deletedItems = this.items.filter((item: ItemGURPS) => !!item.id && ids.includes(item.id));
		if (this.parent)
			await this.parent.updateEmbeddedDocuments("Item", [
				{ _id: this.id, "flags.gcsga.contentsData": newContainedItems },
			]);
		else await this.setCollection(this, newContainedItems);
		return deletedItems;
	}

	/**
	 *
	 * @param embeddedName The name of the embedded Document type
	 * @returns The Collection instance of embedded Documents of the requested type
	 */
	getEmbeddedCollection(
		embeddedName: string,
		// ): EmbeddedCollection<DocumentConstructor, AnyDocumentData> {
	): any {
		if (embeddedName === "Item") return this.items;
		return super.getEmbeddedCollection(embeddedName);
	}

	/**
	 * Prepare all embedded Document instances which exist within this primary Document
	 */
	prepareEmbeddedDocuments(): void {
		super.prepareEmbeddedDocuments();
		const containedItems = getProperty(this, "data.flags.gcsga.contentsData") ?? [];
		const oldItems = this.items;
		// this.items = new EmbeddedCollection(this.data, [], ItemGURPS);
		this.items = new foundry.utils.Collection();
		containedItems.forEach((itemData: ItemDataGURPS) => {
			//@ts-ignore itemData._id
			if (!oldItems?.has(itemData._id)) {
				//@ts-ignore
				const theItem = new CONFIG.Item.documentClass(itemData, { parent: this });
				//@ts-ignore
				this.items?.set(itemData._id, theItem);
			} else {
				//@ts-ignore itemData._id
				const currentItem = oldItems.get(itemData._id);
				if (currentItem) {
					setProperty(currentItem.data._source, "flags", itemData.flags);
					setProperty(currentItem.data._source, "data", itemData.data);
					currentItem.prepareData();
					//@ts-ignore itemData._id
					this.items?.set(itemData._id, currentItem);
				}
			}
		});
	}

	/**
	 * Hack to get Active Effects working properly with nested items
	 * Currently breaks something, will get back to this if need be
	 * @override
	 * @param items Array of nested Items
	 * @param context Additional context
	 */
	async _onCreateDocuments(items: Array<ItemGURPS>, context: DocumentModificationContext) {
		// const toCreate = [];
		// for (const item of items) {
		// 	for (const e of item.effects) {
		// 		if (!e.data.transfer) continue;
		// 		const effectData = e.toJSON();
		// 		effectData.origin = item.uuid;
		// 		toCreate.push(effectData);
		// 	}
		// }
		// if (!toCreate.length) return [];
		// const cls = getDocumentClass('ActiveEffect');
		// return cls.createDocuments(toCreate, context);
	}

	async setCollection(item: ContainerGURPS, contents: Array<ItemDataGURPS>) {
		item.update({ "flags.gcsga.conentsData": duplicate(contents) });
	}
}

//@ts-ignore
export interface ContainerGURPS extends ItemGURPS {
	readonly data: BaseContainerData;
	// items: EmbeddedCollection<ItemDataGURPS, any>;
	items: foundry.utils.Collection<ItemGURPS>;
}
