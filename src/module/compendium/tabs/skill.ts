import { CompendiumBrowser } from "..";
import { CompendiumTab } from "./base";

export class CompendiumSkillTab extends CompendiumTab {
	constructor(browser: CompendiumBrowser) {
		super(browser, "skill");
	}
}
