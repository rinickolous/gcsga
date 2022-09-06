import { BaseItemGURPS, TraitContainerGURPS, TraitGURPS } from "@item";
import { SYSTEM_NAME } from "@module/settings";
import { CompendiumBrowser, CompendiumIndexData } from "..";
import { CompendiumTab } from "./base";

export class CompendiumTraitTab extends CompendiumTab {
	override templatePath = `systems/${SYSTEM_NAME}/templates/compendium-browser/trait.hbs`;

	constructor(browser: CompendiumBrowser) {
		super(browser, "trait");
		this.prepareFilterData();
	}

	protected override async loadData(): Promise<void> {
		const traits: CompendiumIndexData[] = [];
		// const indexFields = ["img", "name", "system.tags", "modifiers", "type", "open", "id", "children", "reference", "enabled", "notes", "cr", "formattedCR", "parents"];
		// const indexFields = ["img", "name", "system.tags", "system.notes", `flags.${SYSTEM_NAME}.contentsData`];
		const indexFields = ["img", "name", "system", "flags"];

		for await (const { pack, index } of this.browser.packLoader.loadPacks("Item", this.browser.loadedPacks("trait"), indexFields)) {
			console.log(pack, index);
			for (const traitData of index) {
				// console.log(traitData);
				const trait: TraitGURPS | TraitContainerGURPS = new BaseItemGURPS(traitData as any) as any;
				if (["trait", "trait_container"].includes(traitData.type)) {
					// TODO: hasAllIndexFields
					traits.push({
						_id: traitData._id,
						type: traitData.type,
						name: traitData.name,
						formattedName: trait.formattedName,
						img: traitData.img,
						compendium: pack.collection,
						open: trait.open,
						id: traitData._id,
						children: trait instanceof TraitContainerGURPS ? trait.children : [],
						adjustedPoints: trait.adjustedPoints,
						tags: trait.tags,
						reference: trait.reference,
						enabled: true,
						parents: trait.parents,
						modifiers: trait.modifiers,
						cr: trait.cr,
						formattedCR: trait.formattedCR,
					});
				}
			}
		}

		this.indexData = traits;
	}
}
