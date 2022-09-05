import { RollModifier } from "@module/data";
import { SYSTEM_NAME } from "@module/settings";
import { i18n } from "@util";
import { ModifierWindow } from "./window";

export class ModifierButton extends Application {
	constructor(options = {}) {
		super(options);
		this.showing = false;
		this.window = new ModifierWindow(this, {});
	}

	async render(
		force?: boolean | undefined,
		options?: Application.RenderOptions<ApplicationOptions> | undefined,
	): Promise<unknown> {
		await this.recalculateModTotal((game as Game).user);
		return super.render(force, options);
	}

	static get defaultOptions(): ApplicationOptions {
		return mergeObject(super.defaultOptions, {
			popOut: false,
			minimizable: false,
			resizable: false,
			id: "ModifierButton",
			template: `systems/${SYSTEM_NAME}/templates/modifier-app/button.hbs`,
			classes: ["modifier-button"],
		});
	}

	getData(options?: Partial<ApplicationOptions> | undefined): object {
		const user = (game as Game).user;
		let total = user?.getFlag(SYSTEM_NAME, "modifierTotal") ?? 0;

		return mergeObject(super.getData(options), {
			total: total,
		});
	}

	protected _injectHTML(html: JQuery<HTMLElement>): void {
		if ($("body").find("#modifier-app").length === 0) {
			html.insertAfter($("body").find("#hotbar"));
			this._element = html;
		} else {
			throw new Error(i18n("gurps.error.modifier_app_load_failed"));
		}
	}

	activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html);
		html.on("click", event => this._onClick(event));
		html.on("wheel", event => this._onMouseWheel(event));
	}

	async _onClick(event: JQuery.ClickEvent): Promise<void> {
		event.preventDefault();
		if (this.showing) {
			this.window.close();
		} else {
			await this.window.render(true);
		}
	}

	async _onMouseWheel(event: JQuery.TriggeredEvent) {
		// event.preventDefault();
		const originalEvent = event.originalEvent;
		if (originalEvent instanceof WheelEvent) {
			const delta = Math.round(originalEvent.deltaY / -100);
			return this.window.addModifier({
				name: "",
				modifier: delta,
				tags: [],
			});
		}
	}

	async recalculateModTotal(
		user: StoredDocument<User> | null,
	): Promise<unknown> {
		if (!user) return;
		let total = 0;
		const mods: RollModifier[] =
			(user.getFlag(SYSTEM_NAME, "modifierStack") as RollModifier[]) ??
			[];
		if (mods.length > 0)
			for (const m of mods) {
				total += m.modifier;
			}
		await user.setFlag(SYSTEM_NAME, "modifierTotal", total);
	}
}

export interface ModifierButton extends Application {
	showing: boolean;
	window: ModifierWindow;
}
