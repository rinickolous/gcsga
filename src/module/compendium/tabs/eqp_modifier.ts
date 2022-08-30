import { SYSTEM_NAME } from "@module/settings";
import { CompendiumBrowser } from "..";
import { CompendiumTab } from "./base";

export class CompendiumEquipmentModifierTab extends CompendiumTab {
	override templatePath = `systems/${SYSTEM_NAME}/templates/compendium-browser/eqp_modifier.hbs`;

	constructor(browser: CompendiumBrowser) {
		super(browser, "eqp_modifier");
	}
}
