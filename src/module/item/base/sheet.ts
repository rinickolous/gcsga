export class ItemSheetGURPS extends ItemSheet {
	/**
	 * @override 
	 * @param {Partial<ItemSheet.Options>} options?
	 * @returns any
	 */
	getData(options?: Partial<ItemSheet.Options>): any {
		const itemData = this.object.toObject(false);
		const sheetData = {
			...super.getData(options),
			...{
				document: this.item,
				item: itemData,
				data: itemData.data,
			},
		};

		return sheetData;
	}
}
