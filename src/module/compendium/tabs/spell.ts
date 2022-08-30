import { CompendiumBrowser } from "..";
import { CompendiumTab } from "./base";

export class CompendiumSpellTab extends CompendiumTab {
	constructor(browser: CompendiumBrowser) {
		super(browser, "spell");
	}
}
