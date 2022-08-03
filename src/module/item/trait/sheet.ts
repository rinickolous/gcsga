import { ContainerSheetGURPS } from "@item/container/sheet";
import { SYSTEM_NAME } from "@module/settings";
import { TraitGURPS } from ".";

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
		html.find(".input.enabled").on("click", event => this._toggleEnabled(event));
	}

	protected _toggleEnabled(event: JQuery.ClickEvent): any {
		event.preventDefault();
		//TODO change
		return this.item?.update({ "system.disabled": !(this.item as unknown as TraitGURPS).system.disabled });
	}
}
