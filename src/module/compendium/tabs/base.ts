import { CompendiumBrowser, CompendiumIndexData } from "..";
import { TabName } from "../data";
import { BaseFilterData } from "./data";

export abstract class CompendiumTab {
	protected browser: CompendiumBrowser;
	defaultFilterData!: BaseFilterData;
	tabName: TabName;
	isInitialized = false;
	protected indexData: CompendiumIndexData[] = [];
	// TODO: reimplement
	// abstract templatePath: string;
	templatePath = "";
	filterData!: BaseFilterData;
	scrollLimit = 100;

	constructor(browser: CompendiumBrowser, tabName: TabName) {
		this.browser = browser;
		this.tabName = tabName;
	}

	async init(): Promise<void> {
		await this.loadData();
		this.isInitialized = true;
		this.defaultFilterData = deepClone(this.filterData);
	}

	/** Load and prepare the compendium index and set filter options */
	protected async loadData(): Promise<void> {
		return;
	}
}
