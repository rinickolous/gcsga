import { SYSTEM_NAME } from "@module/settings";
import { CompendiumBrowser } from "..";
import { CompendiumTab } from "./base";

export class CompendiumSkillTab extends CompendiumTab {
	override templatePath = `systems/${SYSTEM_NAME}/templates/compendium-browser/skill.hbs`;

	constructor(browser: CompendiumBrowser) {
		super(browser, "skill");
	}
}
