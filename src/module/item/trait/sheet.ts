import { ContainerSheetGURPS } from "@item/container/sheet";
import { TraitGURPS } from ".";

export class TraitSheet extends ContainerSheetGURPS {
	static get defaultOptions(): DocumentSheetOptions {
		const options = super.defaultOptions;
		mergeObject(options, {
			classes: options.classes.concat(["trait"]),
		});
		return options;
	}

	getData(options?: Partial<DocumentSheetOptions> | undefined) {
		//@ts-ignore sort not in Item type yet
		// const items = deepClone((this.item as TraitGURPS).items.map(item => item as Item).sort((a: Item, b: Item) => (a.sort || 0) - (b.sort || 0)));
		const sheetData = {
			...super.getData(options),
			...{
				// modifiers: items.filter(e => e.type.includes("modifier")),
			},
		};
		return sheetData;
	}

	activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html);
		html.find(".item").on("dblclick", event => this._openItemSheet(event));
	}

	protected async _openItemSheet(event: JQuery.DoubleClickEvent) {
		event.preventDefault();
		const id = $(event.currentTarget).data("item-id");
		const item = (this.item as TraitGURPS).deepItems.get(id);
		item?.sheet?.render(true);
	}

	protected _updateObject(event: Event, formData: Record<string, unknown>): Promise<unknown> {
		if (Object.keys(formData).includes("system.disabled")) formData["system.disabled"] = !formData["system.disabled"];
		return super._updateObject(event, formData);
	}
}
