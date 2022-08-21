import { DiceGURPS } from "@module/dice";
import { SYSTEM_NAME } from "@module/settings";
import { toArray } from "@util";
import { MeleeWeapon } from "./melee";
import { RangedWeapon } from "./ranged";

export class WeaponSheet extends FormApplication {
	constructor(data: { weapon: MeleeWeapon; index: number }, options?: any) {
		super(data, options);
		this.object = data.weapon;
		this.index = data.index;
	}

	activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html);
		html.find("span.input").on("blur", event => this._onSubmit(event as any));
	}

	get template(): string {
		return `systems/${SYSTEM_NAME}/templates/item/${this.object.type.replaceAll("_", "-")}.hbs`;
	}

	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["form", "melee-weapon", "gcsga", "item"],
			width: 420,
			resizable: true,
			submitOnChange: true,
			submitOnClose: true,
			closeOnSubmit: false,
			title: "TODO change me",
		});
	}

	getData(options?: Partial<FormApplicationOptions> | undefined): any {
		return {
			...super.getData(options),
			config: (CONFIG as any).GURPS,
		};
	}

	protected _getHeaderButtons(): Application.HeaderButton[] {
		const all_buttons = super._getHeaderButtons();
		all_buttons.at(-1)!.label = "";
		all_buttons.at(-1)!.icon = "gcs-circled-x";
		return all_buttons;
	}

	protected _updateObject(event: Event, formData: Record<string, unknown>): Promise<any> {
		console.log("_updateObject", this.object);
		console.log(event, formData);
		formData["damage.base"] = new DiceGURPS(formData["damage.base"] as string).stringExtra(false);

		const weaponList: MeleeWeapon[] = toArray(duplicate(getProperty(this.object.parent, "system.weapons")));
		for (const [k, v] of Object.entries(formData)) {
			setProperty(weaponList[this.index], k, v);
		}

		return this.object.parent.update({ "system.weapons": weaponList });
	}
}

export interface WeaponSheet extends FormApplication {
	object: MeleeWeapon | RangedWeapon;
	index: number;
}
