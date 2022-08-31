import { SYSTEM_NAME } from "@module/settings";
import { CompendiumBrowser, CompendiumIndexData } from "..";
import { CompendiumTab } from "./base";
import { FilterData } from "./data";

export class CompendiumEquipmentTab extends CompendiumTab {
	override templatePath = `systems/${SYSTEM_NAME}/templates/compendium-browser/equipment.hbs`;
	filterData!: FilterData;

	constructor(browser: CompendiumBrowser) {
		super(browser, "equipment");

		this.prepareFilterData();
	}

	// protected override prepareFilterData(): void {
	// 	this.filterData = {
	// 		search: {
	// 			text: "",
	// 		},
	// 		order: {
	// 			by: "name",
	// 			direction: "asc",
	// 			options: {},
	// 		},
	// 	};
	// }

	protected override async loadData(): Promise<void> {
		const equipment: CompendiumIndexData[] = [];
		const indexFields = ["img", "name", "system.tags"];

		for await (const { pack, index } of this.browser.packLoader.loadPacks(
			"Item",
			this.browser.loadedPacks("equipment"),
			indexFields,
		)) {
			console.log(pack, index);
			for (const equipmentData of index) {
				if (
					["equipment", "equipment_container"].includes(
						equipmentData.type,
					)
				) {
					// TODO: hasAllIndexFields
					equipment.push({
						_id: equipmentData._id,
						type: equipmentData.type,
						name: equipmentData.name,
						img: equipmentData.img,
						compendium: pack.collection,
					});
				}
			}
		}

		this.indexData = equipment;
	}
}
