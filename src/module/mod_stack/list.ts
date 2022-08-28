import { RollModifier } from "@module/data";
import { SYSTEM_NAME } from "@module/settings";

export class ModifierAppList extends Application {
	constructor(list: any[], options = {}) {
		super(options);

		this.mods = list;
		this.selection = -1;
		this.customMod = null;
	}

	static get defaultOptions(): ApplicationOptions {
		return mergeObject(super.defaultOptions, {
			id: "ModifierAppList",
			template: `systems/${SYSTEM_NAME}/templates/modifier-app/list.hbs`,
			popOut: false,
			minimizable: false,
			classes: ["modifier-app-list"],
		});
	}

	activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html);

		// Get position
		const parent = $("#modifier-app-window").find(".searchbar");
		const parentTop = parent.offset()?.top ?? 0; // might use position() depending on as yet unencountered issues
		const parentLeft = parent.offset()?.left ?? 0;
		// let parentWidth = parseFloat(parent.css("width").replace("px", ""));
		let height = parseFloat(html.css("height").replace("px", ""));

		let left = Math.max(parentLeft, 10);
		html.css("left", `${left}px`);
		html.css("top", `${parentTop - height}px`);
		parent.css("width", html.css("width"));
		// html.css("width", `${parentWidth}px`);
	}

	getData(options?: Partial<ApplicationOptions> | undefined): object | Promise<object> {
		if (this.customMod && !this.mods.includes(this.customMod)) {
			this.mods.unshift(this.customMod);
			this.selection = 0;
		}

		const mods: any[] = this.mods;
		const pinnedMods: any[] = ((game as Game).user?.getFlag(SYSTEM_NAME, "pinnedMods") as []) ?? [];
		mods.forEach(m => {
			if (pinnedMods.find(e => e.name == m.name && e.modifier && m.modifier)) m.pinned = true;
			else m.pinned = false;
		});

		return mergeObject(super.getData, {
			mods: mods,
			selection: this.selection,
		});
	}
}

export interface ModifierAppList extends Application {
	mods: RollModifier[];
	customMod: RollModifier | null;
	selection: number;
}
