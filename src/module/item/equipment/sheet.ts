import { ContainerSheetGURPS } from "@item/container/sheet";
import { EquipmentGURPS } from ".";

export class EquipmentSheet extends ContainerSheetGURPS {
	static get defaultOptions(): DocumentSheetOptions {
		const options = super.defaultOptions;
		mergeObject(options, {
			classes: options.classes.concat(["equipment"]),
		});
		return options;
	}

	getData(options?: Partial<DocumentSheetOptions> | undefined) {
		//@ts-ignore sort not in Item type yet
		const items = deepClone((this.item as EquipmentGURPS).items.map(item => item as Item).sort((a: Item, b: Item) => (a.sort || 0) - (b.sort || 0)));
		const sheetData = {
			...super.getData(options),
			...{
				modifiers: items.filter(e => e.type.includes("modifier")),
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
		const item = (this.item as EquipmentGURPS).deepItems.get(id);
		item?.sheet?.render(true);
	}
}
