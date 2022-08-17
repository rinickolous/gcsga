import { ContainerSheetGURPS } from "@item/container/sheet";
import { SYSTEM_NAME } from "@module/settings";

export class TraitSheet extends ContainerSheetGURPS {
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

	activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html);
	}

	protected _updateObject(event: Event, formData: Record<string, unknown>): Promise<unknown> {
		if (Object.keys(formData).includes("system.disabled")) formData["system.disabled"] = !formData["system.disabled"];
		return super._updateObject(event, formData);
	}
}
