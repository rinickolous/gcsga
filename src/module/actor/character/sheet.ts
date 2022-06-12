import { ActorSheetGURPS } from "@actor/base/sheet";
import { ContainerGURPS, ItemGURPS } from "@item";
import { BaseContainerData } from "@item/container/data";
import { EquipmentData, ItemDataGURPS } from "@item/data";
import { MeleeWeapon, RangedWeapon } from "@module/data";
import { openPDF } from "@module/modules/pdfoundry";
import { SYSTEM_NAME } from "@module/settings";
import { dollarFormat, sheetSection } from "@util";
import { CharacterGURPS } from ".";
import { Attribute, AttributeSetting, CharacterSystemData } from "./data";

export class CharacterSheetGURPS extends ActorSheetGURPS {
	editing = false;
	selection = {
		active: "none",
		traits: [] as any[],
		skills: [] as any[],
		spells: [] as any[],
		equipment: [] as any[],
		other_equipment: [] as any[],
		notes: [] as any[],
	};
	prevEvent: Event | undefined;

	/** @override */
	static get defaultOptions(): ActorSheet.Options {
		const options = super.defaultOptions;
		mergeObject(options, {
			width: 824,
			height: 800,
			classes: ["character", "actor", "gcsga"],
		});
		return options;
	}

	/** @override */
	get template(): string {
		return `/systems/${SYSTEM_NAME}/templates/actor/character/sheet.hbs`;
	}

	/** @override */
	activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html);
		html.find(".dropdown-toggle").on("click", this._onCollapseToggle.bind(this));
		html.find(".edit_lock").on("click", this._onEditToggle.bind(this));
		html.find(".input.attr").on("change", this._onAttributeEdit.bind(this));
		html.find(".reference").on("click", this._handlePDF.bind(this));
		html.find(".item").on("dblclick", this._openItemSheet.bind(this));
		html.find(".item").on("dragleave", this._onDragLeave.bind(this));
		html.find(".item").on("dragenter", this._onDragEnter.bind(this));

		// html.find(".item").on("click", this._onItemSelect.bind(this));
	}

	async _onCollapseToggle(event: Event) {
		event.preventDefault();
		//@ts-ignore
		const id: string = $(event.currentTarget).data("item-id");
		//@ts-ignore
		const open: boolean = $(event.currentTarget).attr("class")?.includes("closed") ? true : false;
		//@ts-ignore
		const item = this.actor.deepItems.get(id);
		//@ts-ignore
		return item.update({ _id: id, "data.open": open });
	}

	async _onEditToggle(event: Event) {
		event.preventDefault();
		this.editing = !this.editing;
		//@ts-ignore
		$(event.currentTarget).find("i").toggleClass("fa-unlock fa-lock");
		// this._renderOuter();
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

	//TODO: inactive-select children
	async _onItemSelect(event: Event) {
		event.preventDefault();
		console.log(event);
		//@ts-ignore
		const id: string = $(event.currentTarget).data("item-id") || "";
		//@ts-ignore
		const item: ItemGURPS = this.actor.deepItems.get(id);
		for (const type of ["traits", "skills", "spells", "equipment", "other_equipment", "notes"])
			if (sheetSection(item, type)) {
				this.selection.active = type;
				break;
			}
		//@ts-ignore
		this.selection[this.selection.active].push(id);
		if (this.prevEvent && this.prevEvent.type == "click" && event.timeStamp - this.prevEvent?.timeStamp > 500)
			this.render();
		this.prevEvent = event;
	}

	async _openItemSheet(event: Event) {
		event.preventDefault();
		//@ts-ignore
		const id: string = $(event.currentTarget).data("item-id") || "";
		//@ts-ignore
		const item: ItemGURPS = this.actor.deepItems.get(id);
		item.sheet?.render(true);
	}

	async _onDragEnter(event: Event) {
		event.preventDefault();
		// console.log(event, (event as DragEvent).dataTransfer);
		// (event.currentTarget as HTMLElement).parentElement?.classList.add("drop-in");
		const siblings = Array.prototype.slice.call((event.currentTarget as HTMLElement).parentElement?.children);
		siblings.forEach((e) => e.classList.remove("drop-over"));
		const item = (event.currentTarget as HTMLElement).closest(".item.desc");
		const selection = Array.prototype.slice.call($(item!).nextUntil(".entry-parent"));
		selection.unshift(item);
		selection.forEach((e) => e.classList.add("drop-over"));
		// (event.currentTarget as HTMLElement).closest(".ite")?.classList.add("redline");
	}

	async _onDragLeave(event: Event) {
		event.preventDefault();
		// (event.currentTarget as HTMLElement).classList.remove("redline");
		// (event.currentTarget as HTMLElement).closest(".item.desc")?.classList.remove("redline");
	}

	// async _onItemSelect(event: Event) {
	// 	event.preventDefault();
	// 	//@ts-ignore
	// 	const id: string = $(event.currentTarget).data("item-id") || "";
	// 	//@ts-ignore
	// 	const item: ItemGURPS = this.actor.deepItems.get(id);
	// 	if (["trait", "trait_container"].includes(item.type)) this.selection.active = "traits";
	// 	else if (["skill", "skill_container", "technique"].includes(item.type)) this.selection.active = "skills";
	// 	else if (["spell", "spell_container", "ritual_magic_spell"].includes(item.type))
	// 		this.selection.active = "spells";
	// 	else if (["equipment", "equipment_container"].includes(item.type)) {
	// 		//@ts-ignore
	// 		if (item.getData().other) this.selection.active = "other_equipment";
	// 		else this.selection.active = "equipment";
	// 	}
	// 	const s_id = id.split(" ");
	// 	const f_id = [s_id[s_id.length - 1], s_id];
	// 	let exists_index = -1;
	// 	//@ts-ignore
	// 	for (let i = 0; i < this.selection[this.selection.active].length; i++) {
	// 		//@ts-ignore
	// 		if (this.selection[this.selection.active][i][0] == f_id[0]) {
	// 			exists_index = i;
	// 		}
	// 	}
	// 	//@ts-ignore
	// 	if (event.ctrlKey) {
	// 		//@ts-ignore
	// 		if (exists_index != -1) this.selection[this.selection.active].splice(exists_index, 1);
	// 		//@ts-ignore
	// 		else this.selection[this.selection.active].push(f_id);
	// 		//@ts-ignore
	// 	} else if (event.shiftKey) {
	// 		// note implemented yet
	// 		//@ts-ignore
	// 		this.selection[this.selection.active] = [f_id];
	// 	} else {
	// 		//@ts-ignore
	// 		this.selection[this.selection.active] = [f_id];
	// 	}
	// 	this.render();
	// }

	async _handlePDF(event: Event) {
		event.preventDefault();
		//@ts-ignore
		const pdf = $(event.currentTarget).text();
		if (!!pdf) return openPDF(pdf);
	}

	async _getItem(event: Event) {
		event.preventDefault();
		//@ts-ignore
		const id = $(event.currentTarget)?.attr("data-id") || "";
	}

	/**
	 * @override
	 * @param  {Partial<ActorSheet.Options>} options?
	 * @returns any
	 */
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
				selection: this.selection,
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
		Object.entries(data.attributes).forEach(([k, e]: [string, Attribute]) => {
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
				level: `gcsga.actor.encumbrance.levels.${i}`,
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
		const [traits, skills, spells, equipment, other_equipment, notes] = data.items.reduce(
			(arr: ItemDataGURPS[][], item: ItemGURPS | ContainerGURPS) => {
				const itemData: ItemDataGURPS = this.parseContents(item);
				if (["trait", "trait_container"].includes(item.type)) arr[0].push(itemData);
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

		let carried_weight = 0;
		let carried_value = 0;
		for (const i of equipment) {
			carried_weight += parseFloat(i.data.calc.extended_weight);
			carried_value += parseFloat(i.data.calc.extended_value);
		}

		data.carried_weight = `${carried_weight} lb`;
		data.carried_value = dollarFormat(carried_value);

		data.traits = traits;
		data.skills = skills;
		data.spells = spells;
		data.equipment = equipment;
		data.other_equipment = other_equipment;
		data.notes = notes;
		data.melee = melee;
		data.ranged = ranged;
		data.blocks = {
			traits: traits,
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
		//TODO: check why error
		//@ts-ignore
		const data: ItemDataGURPS = deepClone(item.data);
		if (item.type.includes("_container")) {
			const children: Array<ItemDataGURPS | BaseContainerData> = [];
			(item as ContainerGURPS).items
				.filter((e: ItemGURPS) => !e.type.includes("_modifier"))
				.forEach((value: ItemGURPS) => {
					const childData: ItemDataGURPS | BaseContainerData = this.parseContents(value);
					children.push(childData);
				});
			//@ts-ignore
			(data as BaseContainerData).children = children.sort((a, b) => a.sort - b.sort);
		}
		if (["trait", "trait_container", "equipment", "equipment_container"].includes(item.type)) {
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
		const edit_button = {
			label: "",
			class: "edit-toggle",
			icon: `fas fa-${this.editing ? "un" : ""}lock`,
			onclick: (event: any) => this._onEditToggle(event),
		};
		// if (this.editing) edit_button.icon = "fas fa-unlock";
		const buttons: Application.HeaderButton[] = [
			edit_button,
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
