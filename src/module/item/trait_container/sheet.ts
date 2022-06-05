import { ContainerSheetGURPS } from "@item/container/sheet";

export class TraitContainerSheet extends ContainerSheetGURPS {
	/** @override */
	get template(): string {
		return "/systems/gcsga/templates/item/trait_container/sheet.hbs";
	}

	/** @override */
	static get defaultOptions(): DocumentSheetOptions {
		const options = super.defaultOptions;
		mergeObject(options, {
			classes: ["gcs_item"],
		});
		return options;
	}

	/** @override */
	getData(
		options?: Partial<DocumentSheetOptions>,
		// ): ItemSheet.Data<DocumentSheetOptions> | Promise<ItemSheet.Data<DocumentSheetOptions>> {
	): any {
		const itemData = this.item.toObject(false);
		console.log(itemData);
		const sheetData = {
			...super.getData(options),
			...{
				options: {
					cr: {
						"-1": "-1",
						"0": "0",
						"6": "6",
						"9": "9",
					},
					cr_adj: {
						none: "none",
						test: "test",
					},
					container_type: {
						group: "group",
						meta_trait: "meta_trait",
						race: "race",
						alternative_abilities: "alternative_abilities",
					},
					ancestry: {
						human: "human",
						elf: "elf",
					},
				},
				editing: true,
				data: itemData.data,
			},
		};
		return sheetData;
	}
}
