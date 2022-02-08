import { ActorSheetGURPS } from "@actor/base/sheet";
import { ContainerGURPS, ItemGURPS } from "@item";
import { BaseContainerData } from "@item/container/data";
import { EquipmentData, ItemDataGURPS } from "@item/data";
import { MeleeWeapon, RangedWeapon } from "@module/data";
import { CharacterGURPS } from ".";
import { Attribute, AttributeSetting, CharacterSystemData } from "./data";

export class CharacterSheetGURPS extends ActorSheetGURPS {
	editing = false;

	/** @override */
	static get defaultOptions(): ActorSheet.Options {
		const options = super.defaultOptions;
		mergeObject(options, {
			width: 749,
			height: 800,
			classes: ["gcs"],
		});
		return options;
	}

	/** @override */
	get template(): string {
		return "/systems/gcsga/templates/actor/gcs/sheet.hbs";
	}

	/** @override */
	activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html);
		html.find(".toggle_open").on("click", this._onCollapseToggle.bind(this));
		html.find(".edit_lock").on("click", this._onEditToggle.bind(this));
		html.find(".input.attr").on("change", this._onAttributeEdit.bind(this));
	}

	async _onCollapseToggle(event: Event) {
		event.preventDefault();
		//@ts-ignore
		const id: string = $(event.currentTarget).attr("data-id") || "";
		//@ts-ignore
		const open: boolean = $(event.currentTarget).attr("class")?.includes("fa-caret-right") ? true : false;
		console.log(id);
		console.log(await this.actor.getEmbeddedDocument("Item", id));
		return this.actor.updateEmbeddedDocuments("Item", [{ _id: id, "data.open": open }]);
	}

	async _onEditToggle(event: Event) {
		event.preventDefault();
		// console.log(this.editing);
		this.editing = !this.editing;
		return this.render();
	}

	async _onAttributeEdit(event: Event) {
		event.preventDefault();
		// @ts-ignore
		const id = $(event.currentTarget).attr("data-id") || "";
		//@ts-ignore
		const value = $(event.currentTarget).val();
		//@ts-ignore
		return this.actor.setAttributeValue(id, value);
	}

	/** @override */
	getData(options?: Partial<ActorSheet.Options>): any {
		const actorData = this.actor.toObject(false);
		const items = deepClone(
			this.actor.items.map((item) => item).sort((a, b) => (a.data.sort || 0) - (b.data.sort || 0)),
		);
		(actorData as any).items = items;
		const [primary_attributes, secondary_attributes, pool_attributes] = this.prepareAttributes(
			actorData.data as CharacterSystemData,
		);
		const [encumbrance, lifting] = this.prepareLifts(actorData.data as CharacterSystemData);

		const sheetData = {
			...super.getData(options),
			...{
				cssClass: this.actor.isOwner ? "editable" : "locked",
				document: this.actor,
				owner: this.actor.isOwner,
				actor: actorData,
				data: actorData.data,
				items: items,
				primary_attributes: primary_attributes,
				secondary_attributes: secondary_attributes,
				pool_attributes: pool_attributes,
				encumbrance: encumbrance,
				lifting: lifting,
				user: { isGM: (game as any).user.isGM },
				editing: this.editing || false,
			},
		};

		this.prepareItems(sheetData);
		return sheetData;
	}

	prepareAttributes(data: CharacterSystemData) {
		const primary_attributes: {
			id: string;
			name: string;
			full_name: string;
			value: number;
			points: number;
		}[] = [];
		const secondary_attributes: {
			id: string;
			name: string;
			full_name: string;
			value: number;
			points: number;
		}[] = [];
		const pool_attributes: {
			id: string;
			name: string;
			full_name: string;
			value: number;
			points: number;
			current: number | undefined;
			state: Record<string, unknown>;
		}[] = [];
		// console.log(data.attributes, data.settings.attributes);
		Object.entries(data.attributes).forEach(([k, e]: [string, Attribute]) => {
			// console.log("k", k, "e", e, data.settings.attributes);
			const f: AttributeSetting = data.settings.attributes[k];
			if (f.type === "pool") {
				let state = {};
				if (f.thresholds?.length) {
					for (const [i, t] of f.thresholds?.entries()) {
						if (
							(e.calc.current &&
								e.calc.current <= e.calc.value * (t.multiplier / t.divisor) + t.addition) ||
							i === f.thresholds.length - 1
						) {
							state = t;
							break;
						}
					}
				}
				pool_attributes.push({
					id: f.id,
					name: f.name,
					full_name: f.full_name,
					value: e.calc.value,
					points: e.calc.points,
					current: e.calc.current,
					state: state,
				});
			} else if (parseInt(f.attribute_base).toString() === f.attribute_base) {
				primary_attributes.push({
					id: f.id,
					name: f.name,
					full_name: f.full_name,
					value: e.calc.value,
					points: e.calc.points,
				});
			} else {
				secondary_attributes.push({
					id: f.id,
					name: f.name,
					full_name: f.full_name,
					value: e.calc.value,
					points: e.calc.points,
				});
			}
		});
		return [primary_attributes, secondary_attributes, pool_attributes];
	}

	prepareLifts(data: CharacterSystemData) {
		const enc = [];
		const bl = parseFloat(data.calc.basic_lift);
		//@ts-ignore
		const unit = CONFIG.GURPS.Actor.weightUnits[data.settings.default_weight_units as GCSWeightUnits].label;
		const enc_multiplier = [1, 2, 3, 6, 10];
		const lifts_multiplier = [1, 2, 8, 12, 20, 15, 50];
		for (let i = 0; i <= 4; i++) {
			enc.push({
				active: this.isActiveEncumbrance(data, bl * enc_multiplier[i]),
				level: `gcsga.sheet.encumbrance.levels.${i}`,
				max_load: `${bl * enc_multiplier[i]} ${unit}`,
				move: data.calc.move[i],
				dodge: data.calc.dodge[i],
			});
		}
		const lifts = {
			basic_lift: `${bl * lifts_multiplier[0]} ${unit}`,
			one_handed_lift: `${bl * lifts_multiplier[1]} ${unit}`,
			two_handed_lift: `${bl * lifts_multiplier[2]} ${unit}`,
			shove: `${bl * lifts_multiplier[3]} ${unit}`,
			running_shove: `${bl * lifts_multiplier[4]} ${unit}`,
			carry_on_back: `${bl * lifts_multiplier[5]} ${unit}`,
			shift_slightly: `${bl * lifts_multiplier[6]} ${unit}`,
		};

		return [enc, lifts];
	}

	// CHANGE LATER
	isActiveEncumbrance(data: CharacterSystemData, level: number) {
		if (data == data && level === 20) return true;
		return false;
	}

	prepareItems(data: any) {
		// console.log(data.items);
		const [advantages, skills, spells, equipment, other_equipment, notes] = data.items.reduce(
			(arr: ItemDataGURPS[][], item: ItemGURPS | ContainerGURPS) => {
				const itemData: ItemDataGURPS = this.parseContents(item);
				if (["advantage", "advantage_container"].includes(item.type)) arr[0].push(itemData);
				else if (["skill", "technique", "skill_container"].includes(item.type)) arr[1].push(itemData);
				else if (["spell", "ritual_magic_spell", "spell_container"].includes(item.type)) arr[2].push(itemData);
				else if (["equipment", "equipment_container"].includes(item.type)) {
					if ((itemData as EquipmentData).data.other) arr[4].push(itemData);
					else arr[3].push(itemData);
				} else if (["note", "note_container"].includes(item.type)) arr[5].push(itemData);
				return arr;
			},
			[[], [], [], [], [], []],
		);

		const melee: MeleeWeapon[] = [];
		const ranged: RangedWeapon[] = [];
		const reactions: any[] = [];
		const conditional_modifiers: any[] = [];
		data.advantages = advantages;
		data.skills = skills;
		data.spells = spells;
		data.equipment = equipment;
		data.other_equipment = other_equipment;
		data.notes = notes;
		data.melee = melee;
		data.ranged = ranged;
		data.blocks = {
			advantages: advantages,
			skills: skills,
			spells: spells,
			equipment: equipment,
			other_equipment: other_equipment,
			notes: notes,
			melee: melee,
			ranged: ranged,
			reactions: reactions,
			conditional_modifiers: conditional_modifiers,
		};
	}

	parseContents(item: ItemGURPS | ContainerGURPS) {
		const data: ItemDataGURPS = deepClone(item.data);
		if (!!(data as any).data.data) data.data = (data as any).data.data;
		// console.log(data);
		if (item.type.includes("_container")) {
			const children: Array<ItemDataGURPS | BaseContainerData> = [];
			(item as ContainerGURPS).items
				.filter((e: ItemGURPS) => !e.type.includes("_modifier"))
				.forEach((value: ItemGURPS) => {
					const childData: ItemDataGURPS | BaseContainerData = this.parseContents(value);
					children.push(childData);
				});
			(data as BaseContainerData).children = children;
		}
		if (["advantage", "advantage_container", "equipment", "equipment_container"].includes(item.type)) {
			const modifiers: Array<ItemDataGURPS> = [];
			(item as ContainerGURPS).items
				.filter((e: ItemGURPS) => e.type.includes("modifier"))
				.forEach((value: ItemGURPS) => {
					const modData: ItemDataGURPS = this.parseContents(value);
					modifiers.push(modData);
				});
			data.modifiers = modifiers;
		}
		return data;
	}

	/** @override */
	protected async _updateObject(event: Event, formData: object): Promise<unknown> {
		return super._updateObject(event, formData);
	}

	/** @override */
	protected _getHeaderButtons(): Application.HeaderButton[] {
		const buttons: Application.HeaderButton[] = [
			{
				label: "Import",
				class: "import",
				icon: "fas fa-file-import",
				onclick: (event) => this._onFileImport(event),
			},
		];
		return buttons.concat(super._getHeaderButtons());
	}

	async _onFileImport(event: any) {
		event.preventDefault();
		// FIX LATER
		(this.actor as unknown as CharacterGURPS).importCharacter();
	}
}
