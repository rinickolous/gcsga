import { SYSTEM_NAME } from "@module/settings";
import { CompendiumBrowser } from "..";
import { CompendiumTab } from "./base";

export class CompendiumSpellTab extends CompendiumTab {
	override templatePath = `systems/${SYSTEM_NAME}/templates/compendium-browser/spell.hbs`;

	constructor(browser: CompendiumBrowser) {
		super(browser, "spell");
	}
}
