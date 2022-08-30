import { CompendiumBrowser } from "..";
import { CompendiumTab } from "./base";

export class CompendiumNoteTab extends CompendiumTab {
	constructor(browser: CompendiumBrowser) {
		super(browser, "note");
	}
}
