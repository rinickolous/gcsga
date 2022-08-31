import { g } from "@module/constants";
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
	tabs: Record<Exclude<TabName, "settings">, BrowserTab>;
	packLoader = new PackLoader();
	activeTab!: TabName;
	navigationTab!: Tabs;

	initialFilter: any = {};

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

	private async renderReultsList(
		html: HTMLElement,
		list: HTMLUListElement,
		start = 0,
	): Promise<void> {
		const currentTab =
			this.activeTab !== "settings" ? this.tabs[this.activeTab] : null;
		if (!currentTab) return;

		const newResults = await currentTab.renderResults(start);
		this.activateResultListeners(newResults);
		const fragment = document.createDocumentFragment();
		fragment.append(...newResults);
		list.append(fragment);
		for (const dragDropHandler of this._dragDrop) {
			dragDropHandler.bind(html);
		}
	}

	private activateResultListeners(liElements: HTMLLIElement[] = []): void {
		for (const liElement of liElements) {
			const { entryUuid } = liElement.dataset;
			if (!entryUuid) continue;

			const nameAnchor =
				liElement.querySelector<HTMLAnchorElement>("div.name > a");
			if (nameAnchor) {
				nameAnchor.addEventListener("click", async () => {
					const document = (await fromUuid(entryUuid)) as any;
					if (document?.sheet) {
						document.sheet.render(true);
					}
				});
			}
		}
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
		console.warn("checkem");

		// Settings Tab
		if (activeTabName === "settings") {
			// const form = html.querySelector<HTMLFormElement>(".compendium-browser-settings form");
			// if (form) {
			//     form.querySelector("button.save-settings")?.addEventListener("click", async () => {
			//         const formData = new FormData(form);
			//         for (const [t, packs] of Object.entries(this.settings) as [string, { [key: string]: PackInfo }][]) {
			//             for (const [key, pack] of Object.entries(packs) as [string, PackInfo][]) {
			//                 pack.load = formData.has(`${t}-${key}`);
			//             }
			//         }
			//         await game.settings.set("pf2e", "compendiumBrowserPacks", JSON.stringify(this.settings));
			//         this.loadSettings();
			//         this.initCompendiumList();
			//         for (const tab of Object.values(this.tabs)) {
			//             if (tab.isInitialized) {
			//                 await tab.init();
			//                 tab.scrollLimit = 100;
			//             }
			//         }
			//         this.render(true);
			//     });
			// }
			return;
		}

		const currentTab = this.tabs[activeTabName];
		const controlArea =
			_html.querySelector<HTMLDivElement>("div.control-area");
		if (!controlArea) return;

		const list = _html.querySelector<HTMLUListElement>(
			".tab.active ul.item-list",
		);
		console.warn(list);
		if (!list) return;
		list.addEventListener("scroll", () => {
			if (list.scrollTop + list.clientHeight >= list.scrollHeight - 5) {
				const currentValue = currentTab.scrollLimit;
				const maxValue = currentTab.totalItemCount ?? 0;
				if (currentValue < maxValue) {
					currentTab.scrollLimit = Math.clamped(
						currentValue + 100,
						100,
						maxValue,
					);
					this.renderReultsList(_html, list, currentValue);
				}
			}
		});

		this.renderReultsList(_html, list);
	}

	override getData(): object | Promise<object> {
		const activeTab = this.activeTab;

		// Settings
		if (activeTab === "settings") {
			return {
				user: g.user,
				settings: this.settings,
			};
		}

		// Active Tab
		const tab = this.tabs[activeTab];
		if (tab) {
			console.log("active tab", tab);
			return {
				user: g.user,
				[activeTab]: {
					filterData: tab.filterData,
				},
				scrollLimit: tab.scrollLimit,
			};
		}
		return {
			user: g.user,
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
			"world.equipment": true,
		};

		for (const pack of g.packs) {
			//@ts-ignore
			const types = new Set(pack.index.map(entry => entry.type));
			if (types.size === 0) continue;
			console.log("types", types);

			if (["trait", "trait_container"].some(type => types.has(type))) {
				// const load =
				// 	this.settings.trait?.[pack.collection]?.load ??
				// 	!!loadDefault[pack.collection];
				// let load = this.settings.trait?.[pack.collection]?.load ?? !!loadDefault[pack.collection];
				// console.log(pack.collection, load);
				// load = true;
				const load = true;
				settings.trait![pack.collection] = {
					load,
					name: pack.metadata.label,
				};
			}
			if (types.has("modifier")) {
				// TODO: finish
				continue;
			}
			if (
				["equipment", "equipment_container"].some(type =>
					types.has(type),
				)
			) {
				const load = true;
				settings.equipment![pack.collection] = {
					load,
					name: pack.metadata.label,
				};
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
		this.settings = g.settings.get(
			SYSTEM_NAME,
			"compendiumBrowserPacks",
		) as CompendiumBrowserSettings;
	}

	openTab(tab: "trait", filter?: any): Promise<void>;
	openTab(tab: "equipment", filter?: any): Promise<void>;
	async openTab(tab: TabName, filter: any = {}): Promise<void> {
		this.initialFilter = filter;
		await this._render(true);
		this.initialFilter = filter;
		this.navigationTab.activate(tab, { triggerCallback: true });
	}

	async loadTab(tab: TabName): Promise<void> {
		this.activeTab = tab;

		// Settings Tab
		if (tab === "settings") {
			await this.render(true);
			return;
		}
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
		if (tab === "settings") return [];
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
				const pack = g.packs.get(packId);
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
