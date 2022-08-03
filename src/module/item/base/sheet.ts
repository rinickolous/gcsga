export class ItemSheetGURPS extends ItemSheet {
	getData(options?: Partial<ItemSheet.Options>): any {
		const itemData = this.object.toObject(false);
		const sheetData = {
			...super.getData(options),
			...{
				document: this.item,
				item: itemData,
				data: (itemData as any).system,
				config: (CONFIG as any).GURPS,
			},
		};

		return sheetData;
	}

	static get defaultOptions(): DocumentSheetOptions {
		const options = super.defaultOptions;
		mergeObject(options, {
			width: 600,
			min_width: 600,
			classes: options.classes.concat(["item", "gcsga"]),
		});
		return options;
	}
}
