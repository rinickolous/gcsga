import { ContainerSheetGURPS } from "@item/container/sheet";

export class TraitSheet extends ContainerSheetGURPS {
	/** @override */
	get template(): string {
		return "/systems/gcsga/templates/item/trait/sheet.hbs";
	}

	static get defaultOptions(): DocumentSheetOptions {
		const options = super.defaultOptions;
		mergeObject(options, {
			classes: options.classes.concat(["trait"]),
		});
		return options;
	}
}
