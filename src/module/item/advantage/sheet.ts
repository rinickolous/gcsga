import { ContainerSheetGURPS } from "@item/container/sheet";

export class AdvantageSheet extends ContainerSheetGURPS {
	/** @override */
	get template(): string {
		return "/systems/gcsga/templates/item/advantage/sheet.hbs";
	}

	static get defaultOptions(): DocumentSheetOptions {
		const options = super.defaultOptions;
		mergeObject(options, {
			width: 600,
			min_width: 600,
			classes: ["gcs-item"],
		});
		return options;
	}
}
