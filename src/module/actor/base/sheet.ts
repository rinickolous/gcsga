export class ActorSheetGURPS extends ActorSheet {
	/** @override */
	static get defaultOptions(): ActorSheet.Options {
		const options = super.defaultOptions;
		mergeObject(options, {
			classes: ["gcsga"],
		});
		return options;
	}
}
