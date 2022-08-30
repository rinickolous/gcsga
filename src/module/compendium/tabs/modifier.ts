import { SYSTEM_NAME } from "@module/settings";
import { CompendiumBrowser } from "..";
import { CompendiumTab } from "./base";

export class CompendiumTraitModifierTab extends CompendiumTab {
	override templatePath = `systems/${SYSTEM_NAME}/templates/compendium-browser/modifier.hbs`;

	constructor(browser: CompendiumBrowser) {
		super(browser, "modifier");
	}
}
