import { BaseItemGURPS, ItemGURPS } from "@item";
import { ItemDataGURPS } from "@item/data";
import { Metadata } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs";
import { Document } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/module.mjs";
import { ItemDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData";
import { BaseContainerData } from "./data";

export abstract class ContainerGURPS extends BaseItemGURPS {
	items: foundry.utils.Collection<ItemGURPS> = new foundry.utils.Collection();

	// static override get schema(): typeof BaseContainerData {
	// 	return BaseContainerData;
	// }

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
		return (this.system as any).open;
	}

	override async createEmbeddedDocuments(embeddedName: string, data: Record<string, unknown>[], context: DocumentModificationContext & { temporary: false }): Promise<any> {
		if (!Array.isArray(data)) data = [data];
		if (embeddedName !== "Item") return super.createEmbeddedDocuments(embeddedName, data, context);
		const currentItems = duplicate(getProperty(this, "flags.gcsga.contentsData")) ?? [];
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
			if (this.parent) return this.parent.updateEmbeddedDocuments(embeddedName, [{ _id: this._id, "flags.gcsga.contentsData": currentItems }]);
			else this.setCollection(this, currentItems);
		}
		return createdItems;
	}

	override getEmbeddedDocument(embeddedName: string, id: string, options?: { strict?: boolean }): any {
		if (embeddedName !== "Item") return super.getEmbeddedDocument(embeddedName, id, options);
		return this.items.get(id);
	}

	override async updateEmbeddedDocuments(embeddedName: string, updates?: Record<string, unknown>[] | undefined, context?: DocumentModificationContext | undefined): Promise<Document<any, any, Metadata<any>>[]> {
		if (embeddedName !== "Item") return super.updateEmbeddedDocuments(embeddedName, updates, context);
		const containedItems = getProperty(this, "flags.gcsga.contentsData") ?? [];
		if (!Array.isArray(updates)) updates = updates ? [updates] : [];
		const updatedItems: any[] = [];
		const newContainedItems = containedItems.map((existing: any) => {
			const theUpdate = updates?.find(update => update._id === existing._id!);
			if (theUpdate) {
				const newData = mergeObject(theUpdate, existing, {
					overwrite: false,
					insertKeys: true,
					insertValues: true,
					inplace: false,
				});
				if (!!newData["system.prereqs.-=prereqs"]) delete newData["system.prereqs.-=prereqs"];
				// temporary hack to fix prereqs. will fix later
				// TODO fix later
				if (Object.keys(theUpdate).includes("system.prereqs.-=prereqs")) (newData.system as any).prereqs.prereqs = null;
				updatedItems.push(newData);
				return newData;
			}
			return existing;
		});
		if (updatedItems.length > 0) {
			if (this.parent) {
				await this.parent.updateEmbeddedDocuments("Item", [{ _id: this.id, "flags.gcsga.contentsData": newContainedItems }]);
			} else await this.setCollection(this, newContainedItems);
		}
		return updatedItems;
	}

	override async deleteEmbeddedDocuments(embeddedName: string, ids: string[], context?: DocumentModificationContext | undefined): Promise<any[]> {
		if (embeddedName !== "Item") return super.deleteEmbeddedDocuments(embeddedName, ids, context);
		const containedItems = getProperty(this, "flags.gcsga.contentsData") ?? [];
		const newContainedItems = containedItems.filter((itemData: ItemGURPS) => !ids.includes(itemData._id!));
		const deletedItems = this.items.filter((itemData: ItemGURPS) => ids.includes(itemData._id!));
		if (this.parent) await this.parent.updateEmbeddedDocuments("Item", [{ _id: this._id, "flags.gcsga.contentsData": newContainedItems }]);
		else await this.setCollection(this, newContainedItems);
		return deletedItems;
	}

	override prepareEmbeddedDocuments(): void {
		super.prepareEmbeddedDocuments();
		const containedItems = getProperty(this, "flags.gcsga.contentsData") ?? [];
		const oldItems = this.items;
		this.items = new foundry.utils.Collection();
		containedItems.forEach((itemData: any) => {
			if (!oldItems?.has(itemData._id)) {
				const theItem = new CONFIG.Item.documentClass(itemData, { parent: this as any });
				this.items.set(itemData._id, theItem as ItemGURPS);
			} else {
				const currentItem = oldItems.get(itemData._id);
				// setProperty(currentItem!._source, "flags", itemData.flags);
				// setProperty(currentItem!._source, "system", itemData.system);
				setProperty(currentItem!._source, "flags", itemData.flags);
				setProperty(currentItem!._source, "system", itemData.system);
				currentItem?.prepareData();
				this.items.set(itemData._id, currentItem!);
			}
		});
	}

	async setCollection(item: ContainerGURPS, contents: Array<ItemDataGURPS>): Promise<ContainerGURPS | undefined> {
		return item.update({ "flags.gcsga.contentsData": duplicate(contents) });
	}
}

export interface ContainerGURPS extends BaseItemGURPS {
	readonly system: BaseContainerData;
	items: foundry.utils.Collection<ItemGURPS>;
}
