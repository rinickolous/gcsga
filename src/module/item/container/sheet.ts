import { ItemSheetGURPS } from "@item/base/sheet";
import { SYSTEM_NAME } from "@module/settings";

export class ContainerSheetGURPS extends ItemSheetGURPS {
	/** @override */
	get template(): string {
		return `/systems/${SYSTEM_NAME}/templates/item/container-sheet.hbs`;
	}
}
