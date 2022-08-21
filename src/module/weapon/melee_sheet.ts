import { SYSTEM_NAME } from "@module/settings";
import { toArray } from "@util";
import { MeleeWeapon } from "./melee";

export class MeleeSheet extends FormApplication {
	constructor(data: { weapon: MeleeWeapon; index: number }, options?: any) {
		super(data, options);
		this.object = data.weapon;
		this.index = data.index;
	}

	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["form", "melee-weapon", "gcsga"],
			template: `systems/${SYSTEM_NAME}/templates/item/melee-weapon.hbs`,
			width: 400,
		});
	}

	getData(options?: Partial<FormApplicationOptions> | undefined): any {
		return {
			...super.getData(options),
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

		const weaponList: MeleeWeapon[] = toArray(duplicate(getProperty(this.object.parent, "system.weapons")));
		for (const [k, v] of Object.entries(formData)) {
			//@ts-ignore
			weaponList[this.index][k] = v;
		}

		return this.object.parent.update({ "system.weapons": weaponList });
	}
}

export interface MeleeSheet extends FormApplication {
	object: MeleeWeapon;
	index: number;
}
