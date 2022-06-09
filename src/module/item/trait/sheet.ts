import { ContainerSheetGURPS } from "@item/container/sheet";
import { SYSTEM_NAME } from "@module/settings";

export class TraitSheet extends ContainerSheetGURPS {
	/** @override */
	get template(): string {
		return `/systems/${SYSTEM_NAME}/templates/item/trait/sheet.hbs`;
	}

	static get defaultOptions(): DocumentSheetOptions {
		const options = super.defaultOptions;
		mergeObject(options, {
			classes: options.classes.concat(["trait"]),
		});
		return options;
	}
}
