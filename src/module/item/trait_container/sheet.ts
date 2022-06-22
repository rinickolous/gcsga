import { ContainerSheetGURPS } from "@item/container/sheet";
import { SYSTEM_NAME } from "@module/settings";
import { TraitContainerGURPS } from "@item/trait_container";

export class TraitContainerSheet extends ContainerSheetGURPS {
	/** @override */
	get template(): string {
		return `/systems/${SYSTEM_NAME}/templates/item/trait_container/sheet.hbs`;
	}

	/** @override */
	static get defaultOptions(): DocumentSheetOptions {
		const options = super.defaultOptions;
		mergeObject(options, {
			classes: options.classes.concat(["trait_container"]),
		});
		return options;
	}

	activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html);
		html.find(".input.enabled").on("click", (event) => this._toggleEnabled(event));
	}
	private _toggleEnabled(event: JQuery.ClickEvent): any {
		event.preventDefault();
		return this.item.update({ "data.disabled": !(this.item as TraitContainerGURPS).data.data.disabled });
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
