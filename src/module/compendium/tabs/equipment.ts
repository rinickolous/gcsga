import { CompendiumBrowser } from "..";
import { CompendiumTab } from "./base";

export class CompendiumEquipmentTab extends CompendiumTab {
	constructor(browser: CompendiumBrowser) {
		super(browser, "equipment");
	}
}
