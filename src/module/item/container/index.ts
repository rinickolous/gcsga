import { BaseItemGURPS, ItemGURPS } from "@item";
import { ItemDataGURPS } from "@item/data";
import { Metadata } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs";
import { Document } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/module.mjs";
import { ItemDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData";
import { BaseContainerData } from "./data";

export abstract class ContainerGURPS extends BaseItemGURPS {
	items: foundry.utils.Collection<ItemGURPS> = new foundry.utils.Collection();

	static override get schema(): typeof BaseContainerData {
		return BaseContainerData;
	}

	// Getters
	get deepItems(): Collection<ItemGURPS> {
		const deepItems: ItemGURPS[] = [];
		for (const item of this.items) {
			deepItems.push(item);
			if (item instanceof ContainerGURPS)
				item.deepItems.forEach((item: ItemGURPS) => {
					return deepItems.push(item);
				});
		}
		return new Collection(
			deepItems.map(e => {
				return [e.id!, e]; // should never be null
			}),
		);
	}

	get open(): boolean {
		return (this.data.data as any).open;
	}

	override async createEmbeddedDocuments(
		embeddedName: string,
		data: Record<string, unknown>[],
		context: DocumentModificationContext & { temporary: false },
	): Promise<any> {
		if (!Array.isArray(data)) data = [data];
		if (embeddedName !== "Item") return super.createEmbeddedDocuments(embeddedName, data, context);
		const currentItems = duplicate(getProperty(this, "data.flags.gcsga.contentsData")) ?? [];
		const createdItems = [];
		if (data.length > 0) {
			for (const itemData of data) {
				let theData = itemData;
				theData._id = randomID();
				// dumb hack to get this to stop
				theData = new CONFIG.Item.documentClass(theData as unknown as ItemDataConstructorData, {
					parent: this as any,
				}).toJSON();
				currentItems.push(theData);
				createdItems.push(theData);
			}
			if (this.parent)
				return this.parent.updateEmbeddedDocuments(embeddedName, [
					{ _id: this.id, "flags.gcsga.contentsData": currentItems },
				]);
			else this.setCollection(this, currentItems);
		}
		return [];
	}

	override getEmbeddedDocument(embeddedName: string, id: string, options?: { strict?: boolean }): any {
		if (embeddedName !== "Item") return super.getEmbeddedDocument(embeddedName, id, options);
		return this.items.get(id);
	}

	override async updateEmbeddedDocuments(
		embeddedName: string,
		updates?: Record<string, unknown>[] | undefined,
		context?: DocumentModificationContext | undefined,
	): Promise<Document<any, any, Metadata<any>>[]> {
		if (embeddedName !== "Item") return super.updateEmbeddedDocuments(embeddedName, updates, context);
		const containedItems = getProperty(this, "data.flags.gcsga.contentsData") ?? [];
		if (!Array.isArray(updates)) updates = updates ? [updates] : [];
		const updatedItems: any[] = [];
		const newContainedItems = containedItems.map((existing: { _id: string }) => {
			const theUpdate = updates?.find(update => update._id === existing._id);
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
		if (updatedItems.length > 0) {
			if (this.parent) {
				await this.parent.updateEmbeddedDocuments("Item", [
					{ _id: this.id, "flags.gcsga.contentsData": newContainedItems },
				]);
			} else await this.setCollection(this, newContainedItems);
		}
		return updatedItems;
	}

	override async deleteEmbeddedDocuments(
		embeddedName: string,
		ids: string[],
		context?: DocumentModificationContext | undefined,
	): Promise<any[]> {
		if (embeddedName !== "Item") return super.deleteEmbeddedDocuments(embeddedName, ids, context);
		const containedItems = getProperty(this, "data.flags.gcsga.contentsData") ?? [];
		const newContainedItems = containedItems.filter((itemData: ItemDataGURPS) => !ids.includes(itemData._id!));
		const deletedItems = this.items.filter((itemData: ItemGURPS) => ids.includes(itemData.data._id!));
		if (this.parent)
			await this.parent.updateEmbeddedDocuments("Item", [
				{ _id: this.data._id, "flags.gcsga.contentsData": newContainedItems },
			]);
		else await this.setCollection(this, newContainedItems);
		return deletedItems;
	}

	override prepareEmbeddedDocuments(): void {
		super.prepareEmbeddedDocuments();
		const containedItems = getProperty(this, "data.flags.gcsga.contentsData") ?? [];
		const oldItems = this.items;
		this.items = new foundry.utils.Collection();
		containedItems.forEach((itemData: ItemDataGURPS) => {
			if (!oldItems?.has(itemData._id!)) {
				// "this as any" used to ignore parent type incompatibility
				const theItem = new CONFIG.Item.documentClass(itemData as any as ItemDataConstructorData, {
					parent: this as any,
				});
				theItem.prepareData();
				this.items.set(itemData._id!, theItem as ItemGURPS);
			} else {
				const currentItem = oldItems.get(itemData._id!);
				if (currentItem) {
					setProperty(currentItem.data._source, "name", itemData.name);
					setProperty(currentItem.data._source, "flags", itemData.flags);
					setProperty(currentItem.data._source, "data", itemData.data);
					// commented out because may not be necessary
					// setProperty(currentItem.data._source, "sort", itemData.sort);
					currentItem.prepareData();
					this.items.set(itemData._id!, currentItem);
				}
			}
		});
	}

	async setCollection(item: ContainerGURPS, contents: Array<ItemDataGURPS>): Promise<ContainerGURPS | undefined> {
		return item.update({ "flags.gcsga.contentsData": duplicate(contents) });
	}
}

export interface ContainerGURPS extends BaseItemGURPS {
	readonly data: BaseContainerData;
	items: foundry.utils.Collection<ItemGURPS>;
}
