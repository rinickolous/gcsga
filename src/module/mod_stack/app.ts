import { RollModifier } from "@module/data";
import { SYSTEM_NAME } from "@module/settings";
import { i18n } from "@util";
import { ModifierAppWindow } from "./app_window";

export class ModifierApp extends Application {
	constructor(options = {}) {
		super(options);
		console.trace("Create ModifierApp");

		this.showing = false;
		this.window = new ModifierAppWindow(this, {});
	}

	async render(force?: boolean | undefined, options?: Application.RenderOptions<ApplicationOptions> | undefined): Promise<unknown> {
		await this.recalculateModTotal((game as Game).user);
		return super.render(force, options);
	}

	static get defaultOptions(): ApplicationOptions {
		return mergeObject(super.defaultOptions, {
			popOut: false,
			minimizable: false,
			resizable: false,
			id: "ModifierApp",
			template: `systems/${SYSTEM_NAME}/templates/modifier-app/button.hbs`,
			classes: ["modifier-app"],
		});
	}

	getData(options?: Partial<ApplicationOptions> | undefined): object {
		const user = (game as Game).user;
		let total = user?.getFlag(SYSTEM_NAME, "modifierTotal") ?? 0;

		return mergeObject(super.getData, {
			total: total,
		});
	}

	protected _injectHTML(html: JQuery<HTMLElement>): void {
		if ($("body").find("#modifier-app").length === 0) {
			html.insertAfter($("body").find("#hotbar"));
			this._element = html;
		} else {
			throw new Error(i18n("gcsga.error.modifier_app_load_failed"));
		}
	}

	activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html);
		console.warn(html, html.find("#show-popup"));
		html.on("click", event => this._onClick(event));
	}

	async _onClick(event: JQuery.ClickEvent): Promise<void> {
		event.preventDefault();
		if (this.showing) {
			this.window.close();
		} else {
			await this.window.render(true);
		}
	}

	async recalculateModTotal(user: StoredDocument<User> | null): Promise<unknown> {
		if (!user) return;
		let total = 0;
		const mods: RollModifier[] = (user.getFlag(SYSTEM_NAME, "modifierStack") as RollModifier[]) ?? [];
		if (mods.length > 0)
			mods.forEach(m => {
				total += m.modifier;
			});
		await user.setFlag(SYSTEM_NAME, "modifierTotal", total);
	}
}

export interface ModifierApp extends Application {
	showing: boolean;
	window: ModifierAppWindow;
}
