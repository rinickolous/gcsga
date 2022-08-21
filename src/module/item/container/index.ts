import { BaseItemGURPS } from "@item";
import { ItemConstructionContextGURPS } from "@item/base";
import { ContainerDataGURPS, ItemDataGURPS, ItemGURPS } from "@item/data";
import { AnyDocumentData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/data.mjs";
import { Context, Metadata } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs";
import EmbeddedCollection from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/embedded-collection.mjs";
import { Document } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/module.mjs";
import { DocumentConstructor } from "@league-of-foundry-developers/foundry-vtt-types/src/types/helperTypes";
import { BaseContainerSystemData } from "./data";

export abstract class ContainerGURPS extends BaseItemGURPS {
	// items?: EmbeddedCollection<ConfiguredDocumentClass<typeof BaseItemGURPS>, any>;
	items: foundry.utils.Collection<ItemGURPS> = new Collection();

	constructor(data: ContainerDataGURPS, context: Context<Actor> & ItemConstructionContextGURPS = {}) {
		if (!data.flags?.gcsga?.contentsData) mergeObject(data, { "flags.gcsga.contentsData": [] });
		super(data, context);
	}

	// Getters
	get deepItems(): Collection<ItemGURPS> {
		const deepItems: ItemGURPS[] = [];
		if (this.items)
			for (const item of this.items) {
				deepItems.push(item);
				if (item instanceof ContainerGURPS)
					item.deepItems.forEach(item => {
						return deepItems.push(item);
					});
			}
		return new Collection(
			deepItems.map(e => {
				return [e.id!, e];
			}),
		);
	}

	get open(): boolean {
		return (this.system as any).open;
	}

	async createEmbeddedDocuments(embeddedName: string, data: Array<{ name: string; type: string } & Record<string, unknown>>, context: DocumentModificationContext & any): Promise<any> {
		if (embeddedName !== "Item") return super.createEmbeddedDocuments(embeddedName, data, context);
		if (!Array.isArray(data)) data = [data];

		// Prevent creating embeded documents which this type of container shouldn't contain
		data = data.filter(e => (CONFIG as any).GURPS.Item.allowedContents[this.type].includes(e.type));

		const currentItems: any[] = duplicate((this.getFlag("gcsga", "contentsData") as any[]) ?? []);
		if (data.length) {
			for (const item of data) {
				let theItem = item;
				theItem._id = randomID();
				theItem = new CONFIG.Item.documentClass(theItem, { parent: this as any }).toJSON();
				currentItems.push(theItem);
			}
			if (this.parent)
				return this.parent.updateEmbeddedDocuments("Item", [
					{
						_id: this.id,
						"flags.gcsga.contentsData": currentItems,
					},
				]);
			else this.setCollection(currentItems);
		}
	}

	getEmbeddedDocument(embeddedName: string, id: string, options?: { strict?: boolean | undefined } | undefined): Document<any, any, Metadata<any>> | undefined {
		if (embeddedName !== "Item") return super.getEmbeddedDocument(embeddedName, id, options);
		return this.items.get(id);
	}

	async updateEmbeddedDocuments(embeddedName: string, updates: Record<string, unknown>[], context?: DocumentModificationContext | undefined): Promise<Document<any, any, Metadata<any>>[]> {
		if (embeddedName !== "Item") return super.updateEmbeddedDocuments(embeddedName, updates, context);

		const contained: any[] = (this.getFlag("gcsga", "contentsData") as any[]) ?? [];
		if (!Array.isArray(updates)) updates = [updates];
		const updated: any[] = [];
		const newContained = contained.map((existing: ItemGURPS) => {
			const theUpdate = updates.find(update => update._id === existing._id);
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
				updated.push(newData);
				return newData;
			}
			return existing;
		});

		if (updated.length) {
			if (this.parent) {
				await this.parent.updateEmbeddedDocuments("Item", [
					{
						_id: this.id,
						"flags.gcsga.contentsData": newContained,
					},
				]);
			} else {
				await this.setCollection(newContained);
			}
		}
		return updated;
	}

	async setCollection(contents: any): Promise<void> {
		this.update({ "flags.gcsga.contentsData": duplicate(contents) });
	}

	async deleteEmbeddedDocuments(embeddedName: string, ids: string[], context?: DocumentModificationContext | undefined): Promise<Document<any, any, Metadata<any>>[]> {
		if (embeddedName !== "Item") return super.deleteEmbeddedDocuments(embeddedName, ids, context);

		const containedItems: ItemGURPS[] = (this.getFlag("gcsga", "contentsData") as ItemGURPS[]) ?? [];
		const newContainedItems = containedItems.filter(e => !ids.includes(e.id!));
		const deletedItems = containedItems.filter(e => ids.includes(e.id!));

		if (this.parent) {
			await this.parent.updateEmbeddedDocuments("Item", [
				{
					_id: this.id,
					"flags.gcsga.contentsData": newContainedItems,
				},
			]);
		} else {
			await this.setCollection(newContainedItems);
		}
		return deletedItems;
	}

	getEmbeddedCollection(embeddedName: string): EmbeddedCollection<DocumentConstructor, AnyDocumentData> {
		if (embeddedName === "Item") return this.items as any;
		return super.getEmbeddedCollection(embeddedName);
	}

	prepareEmbeddedDocuments(): void {
		super.prepareEmbeddedDocuments();
		const containedItems = (this.getFlag("gcsga", "contentsData") as ItemDataGURPS[]) ?? [];
		const oldItems = this.items ?? new Collection();

		this.items = new Collection();
		containedItems.forEach(item => {
			if (!oldItems.has(item._id!)) {
				const theItem = new CONFIG.Item.documentClass(item, { parent: this as any });
				this.items.set(item._id!, theItem as ItemGURPS);
			} else {
				const currentItem = oldItems.get(item._id!)!;
				setProperty(currentItem._source, "name", item.name);
				setProperty(currentItem._source, "flags", item.flags);
				setProperty(currentItem._source, "system", item.system);
				currentItem.prepareData();
				this.items.set(item._id!, currentItem);
				if (this.sheet) {
					//@ts-ignore
					currentItem.render(false, { action: "update", data: currentItem.toObject() });
				}
			}
		});
	}
}

export interface ContainerGURPS extends BaseItemGURPS {
	readonly system: BaseContainerSystemData;
	// items: foundry.utils.Collection<ItemGURPS>;
	// items?: EmbeddedCollection<ConfiguredDocumentClass<typeof BaseItemGURPS>, any>;
}
