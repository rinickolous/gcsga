import { ItemSheetGURPS } from "@item/base/sheet";

export class ContainerSheetGURPS extends ItemSheetGURPS {
	/** @override */
	get template(): string {
		return "/systems/gcsga/templates/item/container-sheet.hbs";
	}
}
