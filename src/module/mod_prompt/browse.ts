import { RollModifier } from "@module/data";
import { SYSTEM_NAME } from "@module/settings";
import { i18n } from "@util";
import { ModifierWindow } from "./window";

interface ModCategory {
	name: string;
	mods: RollModifier[];
	showing: boolean;
}

export class ModifierBrowse extends Application {
	constructor(window: ModifierWindow, options = {}) {
		super(options);

		this.window = window;
		this.mods = (CONFIG as any).GURPS.modifiers;
		this.selection = [-1, -1, -1];
		this.catShowing = -1;
		this.showing = false;
	}

	get categories() {
		const categories: ModCategory[] = [];
		for (const m of this.mods) {
			for (const c of m.tags) {
				let cat = categories.find(e => e.name == c);
				if (!cat) {
					categories.push({ name: c, mods: [], showing: false });
					cat = categories.find(e => e.name == c);
				}
				cat?.mods.push(m);
			}
		}
		categories.sort((a: ModCategory, b: ModCategory) =>
			a.name > b.name ? 1 : b.name > a.name ? -1 : 0,
		);
		const pinnedMods: RollModifier[] =
			((game as Game).user?.getFlag(SYSTEM_NAME, "pinnedMods") as []) ??
			[];
		categories.push({
			name: i18n("gurps.system.modifier_stack.pinned_category"),
			showing: false,
			mods: pinnedMods,
		});
		return categories;
	}

	static get defaultOptions(): ApplicationOptions {
		return mergeObject(super.defaultOptions, {
			id: "ModifierList",
			template: `systems/${SYSTEM_NAME}/templates/modifier-app/browse.hbs`,
			popOut: false,
			minimizable: false,
			classes: ["modifier-app-browse"],
		});
	}

	activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html);

		// Get position
		const parent = $("#modifier-app-window").find(".searchbar");
		const parentTop = parent.offset()?.top ?? 0; // might use position() depending on as yet unencountered issues
		const parentLeft = parent.offset()?.left ?? 0;
		let parentHeight = parseFloat(parent.css("height").replace("px", ""));
		let height = parseFloat(html.css("height").replace("px", ""));
		let width = parseFloat(html.css("width").replace("px", ""));

		html.css("left", `${parentLeft - width - 5}px`);
		html.css("top", `${parentTop + parentHeight - height}px`);

		// html.find(".browse").on("mouseenter", event => this._onBrowseMouseOver(event));
		// html.find(".browse").on("mouseleave", event => this._onBrowseMouseLeave(event));
		html.find(".browse").on("click", event => this._onBrowseClick(event));
		html.find(".category").on("click", event =>
			this._onCategoryClick(event),
		);
		html.find(".category").on("mouseover", event =>
			this._onCategoryMouseOver(event),
		);
		html.find(".entry").on("click", event => this._onEntryClick(event));
		// html.find(".entry").on("mouseover", event => this._onEntryMouseOver(event));
	}

	_onBrowseMouseOver(event: JQuery.MouseEnterEvent) {
		event.preventDefault();
		// event.stopPropagation();
		this.selection[0] = 0;
		this.render();
	}

	_onBrowseMouseLeave(event: JQuery.MouseLeaveEvent) {
		event.preventDefault();
		console.log("leave");
		// event.stopPropagation();
		this.selection[0] = -1;
		this.render();
	}

	_onBrowseClick(event: JQuery.ClickEvent) {
		event.preventDefault();
		console.log("checkem");
		this.showing = true;
		this.render();
	}

	_onCategoryMouseOver(event: JQuery.MouseOverEvent) {
		if (this.selection[1] == $(event.currentTarget).data("index")) return;
		console.log("woo");
		event.preventDefault();
		event.stopPropagation();
		this.selection[1] = $(event.currentTarget).data("index");
		this.render();
	}

	_onCategoryClick(event: JQuery.ClickEvent) {
		event.preventDefault();
		this.catShowing = this.selection[1];
		this.render();
	}

	_onEntryMouseOver(event: JQuery.MouseOverEvent) {
		// event.preventDefault();
		// event.stopPropagation();
		this.selection[2] = $(event.currentTarget).data("index");
	}

	_onEntryClick(event: JQuery.ClickEvent) {
		event.preventDefault();
		return this.window.addModFromBrowse();
	}

	getData(
		options?: Partial<ApplicationOptions> | undefined,
	): object | Promise<object> {
		const categories = this.categories;
		if (this.catShowing !== -1) categories[this.catShowing].showing = true;
		console.log(this.catShowing, categories);

		return mergeObject(super.getData(options), {
			categories: this.categories,
			selection: this.selection,
			showing: this.showing,
		});
	}
}

export interface ModifierBrowse extends Application {
	mods: RollModifier[];
	selection: [number, number, number];
	showing: boolean;
	window: ModifierWindow;
	catShowing: number;
}
