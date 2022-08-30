import { SYSTEM_NAME } from "@module/settings";
import { i18n } from "@util";
import { BrowserTab, PackInfo, TabData, TabName } from "./data";
import * as browserTabs from "./tabs";

export class CompendiumBrowser extends Application {
	settings!: CompendiumBrowserSettings;
	dataTabsList = [
		"trait",
		"modifier",
		"skill",
		"spell",
		"equipment",
		"eqp_modifier",
		"note",
	] as const;
	tabs: Record<TabName, BrowserTab>;
	packLoader = new PackLoader();
	activeTab!: TabName;
	navigationTab!: Tabs;

	private initialFilter: any = {};

	constructor(options = {}) {
		super(options);
		this.tabs = {
			trait: new browserTabs.Trait(this),
			modifier: new browserTabs.TraitModifier(this),
			skill: new browserTabs.Skill(this),
			spell: new browserTabs.Spell(this),
			equipment: new browserTabs.Equipment(this),
			eqp_modifier: new browserTabs.EquipmentModifier(this),
			note: new browserTabs.Note(this),
		};

		this.loadSettings();
		this.initCompendiumList();
		this.hookTab();
	}

	override get title(): string {
		return i18n("gurps.compendium_browser.title");
	}

	static override get defaultOptions(): ApplicationOptions {
		return mergeObject(super.defaultOptions, {
			id: "compendium-browser",
			classes: [],
			template: `systems/${SYSTEM_NAME}/templates/compendium-browser/compendium-browser.hbs`,
			width: 800,
			height: 700,
			resizable: true,
			dragDrop: [{ dragSelector: ".item" }],
			tabs: [
				{
					navSelector: "nav",
					contentSelector: "section.content",
					initital: "landing-page",
				},
			],
			scrollY: [".control-area", ".item-list"],
		});
	}

	override activateListeners(html: JQuery<HTMLElement>): void {
		const _html = html[0];
		super.activateListeners(html);
		const activeTabName = this.activeTab;

		const currentTab = this.tabs[activeTabName];
		const controlArea =
			_html.querySelector<HTMLDivElement>("div.control-area");
		if (!controlArea) return;
	}

	override getData(
		options?: Partial<ApplicationOptions> | undefined,
	): object | Promise<object> {
		const activeTab = this.activeTab;
		const tab = this.tabs[activeTab];
		if (tab) {
			console.log("active tab", tab);
			return {
				user: (game as Game).user,
				[activeTab]: {
					filterData: tab.filterData,
				},
				scrollLimit: tab.scrollLimit,
			};
		}
		return {
			user: (game as Game).user,
		};
	}

	private initCompendiumList(): void {
		const settings: Omit<
			TabData<Record<string, PackInfo | undefined>>,
			"settings"
		> = {
			trait: {},
			modifier: {},
			skill: {},
			spell: {},
			equipment: {},
			eqp_modifier: {},
			note: {},
		};

		// TODO: get rid of
		const loadDefault: any = {
			"world.Library Test": true,
		};

		for (const pack of (game as Game).packs) {
			//@ts-ignore
			const types = new Set(pack.index.map(entry => entry.type));
			if (types.size === 0) continue;

			if (types.has("trait")) {
				const load =
					this.settings.trait?.[pack.collection]?.load ??
					!!loadDefault[pack.collection];
				// let load = this.settings.trait?.[pack.collection]?.load ?? !!loadDefault[pack.collection];
				console.log(pack.collection, load);
				// load = true;
				// const load = true;
				settings.trait![pack.collection] = {
					load,
					name: pack.metadata.label,
				};
			} else if (types.has("modifier")) {
				// TODO: finish
				continue;
			}
		}

		for (const tab of this.dataTabsList) {
			settings[tab] = Object.fromEntries(
				Object.entries(settings[tab]!).sort(
					([_collectionA, dataA], [_collectionB, dataB]) => {
						return (dataA?.name ?? "") > (dataB?.name ?? "")
							? 1
							: -1;
					},
				),
			);
		}

		this.settings = settings;
	}

	loadSettings(): void {
		this.settings = (game as Game).settings.get(
			SYSTEM_NAME,
			"compendiumBrowserPacks",
		) as CompendiumBrowserSettings;
	}

	openTab(tab: "trait", filter?: any): Promise<void>;
	async openTab(tab: TabName, filter: any = {}): Promise<void> {
		this.initialFilter = filter;
		await this._render(true);
		this.initialFilter = filter;
		this.navigationTab.activate(tab, { triggerCallback: true });
	}

	async loadTab(tab: TabName): Promise<void> {
		this.activeTab = tab;
		const currentTab = this.tabs[tab];
		if (!currentTab.isInitialized) await currentTab?.init();

		this.render(true);
	}

	hookTab(): void {
		this.navigationTab = this._tabs[0];
		const tabCallback = this.navigationTab.callback;
		//@ts-ignore
		this.navigationTab.callback = async (
			event: JQuery.TriggeredEvent | null,
			tabs: Tabs,
			active: TabName,
		) => {
			//@ts-ignore
			tabCallback?.(event, tabs, active);
			await this.loadTab(active);
		};
	}

	loadedPacks(tab: TabName): string[] {
		console.log("loadedPacks", tab);
		console.log(this.settings[tab]);
		return Object.entries(this.settings[tab] ?? []).flatMap(
			([collection, info]) => {
				console.log(collection, info);
				return info?.load ? [collection] : [];
			},
		);
	}
}

class PackLoader {
	loadedPacks: {
		Actor: Record<
			string,
			| { pack: CompendiumCollection<any>; index: CompendiumIndex }
			| undefined
		>;
		Item: Record<
			string,
			| { pack: CompendiumCollection<any>; index: CompendiumIndex }
			| undefined
		>;
	} = { Actor: {}, Item: {} };

	async *loadPacks(
		documentType: "Actor" | "Item",
		packs: string[],
		indexFields: string[],
	) {
		this.loadedPacks[documentType] ??= {};
		// TODO: add progress bar
		// const progress = new Progress
		console.log(packs);
		for (const packId of packs) {
			let data = this.loadedPacks[documentType][packId];
			if (data) {
				// pack already loaded
				// const pack = data;
			} else {
				const pack = (game as Game).packs.get(packId);
				if (!pack) continue;
				if (pack.documentName === documentType) {
					// TODO: fix
					const index = (await pack.getIndex({
						fields: indexFields,
					} as any)) as any;
					const firstResult: Partial<CompendiumIndexData> =
						index.contents.at(0) ?? {};
					if (firstResult.system) {
						data = { pack, index };
						this.loadedPacks[documentType][packId] = data;
					} else continue;
				} else continue;
			}
			console.log("data:", data);
			yield data;
		}
	}
}

type CompendiumIndex = Collection<CompendiumIndexData>;

export interface CompendiumIndexData {
	_id: string;
	type: string;
	name: string;
	// img: ImagePath;
	img?: string | null;
	[key: string]: any;
}

type CompendiumBrowserSettings = Omit<
	TabData<Record<string, PackInfo | undefined>>,
	"settings"
>;
