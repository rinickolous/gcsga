import { ContainerSheetGURPS } from "@item/container/sheet";

export class AdvantageContainerSheet extends ContainerSheetGURPS {
	/** @override */
	get template(): string {
		return "/systems/gcsga/templates/item/advantage-container/sheet.hbs";
	}
}
