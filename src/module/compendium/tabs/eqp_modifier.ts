import { CompendiumBrowser } from "..";
import { CompendiumTab } from "./base";

export class CompendiumEquipmentModifierTab extends CompendiumTab {
	constructor(browser: CompendiumBrowser) {
		super(browser, "eqp_modifier");
	}
}
