import { RollModifier } from "@module/data";
import { SYSTEM_NAME } from "@module/settings";
import { fSearch } from "@util/fuse";
import { ModifierApp } from "./app";
import { ModifierAppList } from "./list";

export class ModifierAppWindow extends Application {
	constructor(button: ModifierApp, options = {}) {
		super(options);

		this.value = "";
		this.button = button;
		this.list = new ModifierAppList([]);
	}

	static get defaultOptions(): ApplicationOptions {
		return mergeObject(super.defaultOptions, {
			id: "ModifierAppWindow",
			template: `systems/${SYSTEM_NAME}/templates/modifier-app/window.hbs`,
			popOut: false,
			minimizable: false,
			classes: ["modifier-app-window"],
		});
	}

	async render(force?: boolean | undefined, options?: Application.RenderOptions<ApplicationOptions> | undefined) {
		this.button.showing = true;
		await super.render(force, options);
		this.list.render(force, options);
	}

	close(options?: Application.CloseOptions | undefined): Promise<void> {
		this.button.showing = false;
		this.list.close(options);
		return super.close(options);
	}

	getData(options?: Partial<ApplicationOptions> | undefined): object | Promise<object> {
		const user = (game as Game).user;
		let modStack = user?.getFlag(SYSTEM_NAME, "modifierStack") ?? [];

		return mergeObject(super.getData, {
			value: this.value,
			applied_mods: modStack,
		});
	}

	activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html);

		// Get position
		const button = $("#modifier-app");
		// const buttonTop = button.offset()?.top ?? 0; // might use position() depending on as yet unencountered issues
		// const buttonLeft = button.offset()?.left ?? 0;
		const buttonTop = button.position()?.top ?? 0;
		const buttonLeft = button.position()?.left + 220 ?? 0;
		let buttonWidth = parseFloat(button.css("width").replace("px", ""));
		// let width = parseFloat(html.find(".searchbar").css("width").replace("px", ""));
		const width = 180;
		let height = parseFloat(html.css("height").replace("px", ""));

		let left = Math.max(buttonLeft + buttonWidth / 2 - width / 2, 10);
		html.css("left", `${left}px`);
		html.css("top", `${buttonTop - height - 10}px`);

		// Focus the textbox on show
		const searchbar = html.find(".searchbar");
		searchbar.trigger("focus");
		searchbar.on("input", event => this._updateQuery(event, searchbar));
		searchbar.on("keydown", event => this._keyDown(event));

		// Modifier Deleting
		html.find(".click-delete").on("click", event => this.removeModifier(event));
	}

	_updateQuery(event: JQuery.TriggeredEvent, html: JQuery<HTMLElement>) {
		const input = String($(event.currentTarget).val());
		html.css("min-width", `${input.length}ch`);
		this.value = input;
		this.list.mods = fSearch((CONFIG as any).GURPS.modifiers, input, {
			includeMatches: true,
			includeScore: true,
			keys: ["name", "modifier", "tags"],
		}).map(e => e.item);
		if (this.list.mods.length > 0) this.list.selection = 0;
		else this.list.selection = -1;

		// Set custom mod
		const customMod: RollModifier = { name: "", modifier: 0, tags: [] };
		const modifierMatch = input.match(/[-+]?[0-9]+\s*/);
		if (modifierMatch) {
			customMod.modifier = parseInt(modifierMatch[0]) ?? 0;
			customMod.name = input.replace(modifierMatch[0], "");
		}
		if (customMod.modifier == 0) this.list.customMod = null;
		else this.list.customMod = customMod;
		this.list.render();
	}

	_keyDown(event: JQuery.KeyDownEvent) {
		if (["ArrowUp", "ArrowDown", "Enter", "Escape"].includes(event.key)) {
			event.preventDefault();
			switch (event.key) {
				case "ArrowUp":
					if (this.list.mods.length == 0) return this.getPinnedMods();
					this.list.selection += 1;
					if (this.list.selection >= this.list.mods.length) this.list.selection = 0;
					return this.list.render();
				case "ArrowDown":
					this.list.selection -= 1;
					if (this.list.selection < 0) this.list.selection = this.list.mods.length - 1;
					return this.list.render();
				case "Enter":
					if (event.shiftKey) return this.togglePin();
					return this.addModifier();
				case "Escape":
					return this.close();
			}
		}
	}

	togglePin() {
		const pinnedMods: RollModifier[] = ((game as Game).user?.getFlag(SYSTEM_NAME, "pinnedMods") as RollModifier[]) ?? [];
		const selectedMod: RollModifier = this.list.mods[this.list.selection];
		const matchingMod = pinnedMods.find(e => e.name == selectedMod.name);
		if (matchingMod) {
			pinnedMods.splice(pinnedMods.indexOf(matchingMod), 1);
		} else {
			pinnedMods.push(selectedMod);
		}
		(game as Game).user?.setFlag(SYSTEM_NAME, "pinnedMods", pinnedMods);
		this.list.render();
	}

	getPinnedMods() {
		const pinnedMods: RollModifier[] = ((game as Game).user?.getFlag(SYSTEM_NAME, "pinnedMods") as RollModifier[]) ?? [];
		this.list.mods = pinnedMods;
		this.list.render();
	}

	addModifier() {
		const modList: RollModifier[] = ((game as Game).user?.getFlag(SYSTEM_NAME, "modifierStack") as RollModifier[]) ?? [];
		const newMod: RollModifier = this.list.mods[this.list.selection];
		if (!newMod) return;
		const oldMod = modList.find(e => e.name == newMod.name);
		if (oldMod) oldMod.modifier += newMod.modifier;
		else modList.push(newMod);
		(game as Game).user?.setFlag(SYSTEM_NAME, "modifierStack", modList);
		this.list.customMod = null;
		this.list.mods = [];
		this.list.selection = -1;
		this.value = "";
		this.render();
		this.button.render();
	}

	removeModifier(event: JQuery.ClickEvent) {
		event.preventDefault();
		const modList: RollModifier[] = ((game as Game).user?.getFlag(SYSTEM_NAME, "modifierStack") as RollModifier[]) ?? [];
		const index = $(event.currentTarget).data("index");
		modList.splice(index, 1);
		(game as Game).user?.setFlag(SYSTEM_NAME, "modifierStack", modList);
		this.render();
		this.button.render();
	}
}

export interface ModifierAppWindow extends Application {
	button: ModifierApp;
	list: ModifierAppList;
	value: string;
}
