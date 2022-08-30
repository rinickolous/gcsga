import { CompendiumBrowser } from "..";
import { CompendiumTab } from "./base";

export class CompendiumTraitModifierTab extends CompendiumTab {
	constructor(browser: CompendiumBrowser) {
		super(browser, "modifier");
	}
}
