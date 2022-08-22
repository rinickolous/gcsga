import { CharacterGURPS } from "@actor";
import { Attribute } from "@module/attribute";
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
		html.find("#defaults .add").on("click", event => this._addDefault(event));
		html.find(".default .remove").on("click", event => this._removeDefault(event));
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
		const attributes: Record<string, string> = {};
		if (this.object.actor) {
			(this.object.actor as unknown as CharacterGURPS).attributes.forEach((e: Attribute) => {
				attributes[e.attr_id] = e.attribute_def.name;
			});
		} else {
			mergeObject(attributes, {
				st: "ST",
				dx: "DX",
				iq: "IQ",
				ht: "HT",
				will: "Will",
				fright_check: "Fright Check",
				per: "Perception",
				vision: "Vision",
				hearing: "Hearing",
				taste_smell: "Taste & Smell",
				touch: "Touch",
				basic_speed: "Basic Speed",
				basic_move: "Basic Move",
				fp: "FP",
				hp: "HP",
			});
		}
		return {
			...super.getData(options),
			config: (CONFIG as any).GURPS,
			attributes: attributes,
			sysPrefix: "",
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

	protected async _addDefault(event: JQuery.ClickEvent): Promise<any> {
		event.preventDefault();
		console.log("checkem");
		const weapons = toArray(duplicate(getProperty(this.object.parent, "system.weapons")));
		const defaults = toArray(duplicate(getProperty(this.object as any, "defaults")));
		defaults.push({
			type: "skill",
			name: "",
			specialization: "",
			modifier: 0,
		});
		const update: any = {};
		this.object["defaults"] = defaults;
		weapons[this.index] = this.object;
		update[`system.weapons`] = weapons;
		return this.object.parent.update(update);
	}

	protected async _removeDefault(event: JQuery.ClickEvent): Promise<any> {
		const index = $(event.currentTarget).data("index");
		const weapons = toArray(duplicate(getProperty(this.object.parent, "system.weapons")));
		const defaults = toArray(duplicate(getProperty(this.object as any, "defaults")));
		defaults.splice(index, 1);
		const update: any = {};
		// update["system.defaults"] = { ...defaults };
		this.object["defaults"] = defaults;
		weapons[this.index] = this.object;
		update[`system.weapons`] = weapons;
		// await this.item.update({ "system.-=defaults": null }, { render: false });
		return this.object.parent.update(update);
	}
}

export interface WeaponSheet extends FormApplication {
	object: MeleeWeapon | RangedWeapon;
	index: number;
}
