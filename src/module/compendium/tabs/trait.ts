import { SYSTEM_NAME } from "@module/settings";
import { CompendiumBrowser, CompendiumIndexData } from "..";
import { CompendiumTab } from "./base";
import { BaseFilterData } from "./data";

export class CompendiumTraitTab extends CompendiumTab {
	override templatePath = `systems/${SYSTEM_NAME}/templates/compendium-browser/trait.hbs`;
	filterData!: BaseFilterData;

	constructor(browser: CompendiumBrowser) {
		super(browser, "trait");

		this.prepareFilterData();
	}

	protected override prepareFilterData(): void {
		this.filterData = {
			search: {
				text: "",
			},
			order: {
				by: "name",
				direction: "asc",
				options: {},
			},
		};
	}

	protected override async loadData(): Promise<void> {
		const traits: CompendiumIndexData[] = [];
		const indexFields = ["img", "name", "system.tags"];

		for await (const { pack, index } of this.browser.packLoader.loadPacks(
			"Item",
			this.browser.loadedPacks("trait"),
			indexFields,
		)) {
			console.log(pack, index);
			for (const traitData of index) {
				if (["trait", "trait_container"].includes(traitData.type)) {
					// TODO: hasAllIndexFields
					traits.push({
						_id: traitData._id,
						type: traitData.type,
						name: traitData.name,
						img: traitData.img,
						compendium: pack.collection,
					});
				}
			}
		}

		this.indexData = traits;
	}
}
