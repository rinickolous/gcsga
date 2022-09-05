import { ActorSheetGURPS } from "@actor/base/sheet";
import {
	EquipmentContainerGURPS,
	EquipmentGURPS,
	ItemGURPS,
	NoteContainerGURPS,
	NoteGURPS,
	RitualMagicSpellGURPS,
	SkillContainerGURPS,
	SkillGURPS,
	SpellContainerGURPS,
	SpellGURPS,
	TechniqueGURPS,
	TraitContainerGURPS,
	TraitGURPS,
} from "@item";
import { Attribute } from "@module/attribute";
import { CondMod } from "@module/conditional-modifier";
import { RollType } from "@module/data";
import { openPDF } from "@module/modules";
import { SYSTEM_NAME } from "@module/settings";
import { MeleeWeapon, RangedWeapon } from "@module/weapon";
import { dollarFormat, RollGURPS } from "@util";
import { CharacterGURPS } from ".";
import { CharacterSheetConfig } from "./config_sheet";

export class CharacterSheetGURPS extends ActorSheetGURPS {
	static override get defaultOptions(): ActorSheet.Options {
		const options = super.defaultOptions;
		mergeObject(options, {
			width: 800,
			height: 800,
			classes: super.defaultOptions.classes.concat(["character"]),
		});
		return options;
	}

	override get template(): string {
		return `/systems/${SYSTEM_NAME}/templates/actor/character/sheet.hbs`;
	}

	protected _onDrop(event: DragEvent): void {
		super._onDrop(event);
	}

	protected async _updateObject(
		event: Event,
		formData: Record<string, unknown>,
	): Promise<unknown> {
		// Edit total points when unspent points are edited
		if (Object.keys(formData).includes("actor.unspentPoints")) {
			formData["system.total_points"] =
				(formData["actor.unspentPoints"] as number) +
				this.actor.spentPoints;
			delete formData["actor.unspentPoints"];
		}
		return super._updateObject(event, formData);
	}

	override activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html);
		html.find(".input").on("change", event => this._resizeInput(event));
		html.find(".dropdown-toggle").on("click", event =>
			this._onCollapseToggle(event),
		);
		html.find(".reference").on("click", event => this._handlePDF(event));
		html.find(".item").on("dblclick", event => this._openItemSheet(event));
		html.find(".equipped").on("click", event =>
			this._onEquippedToggle(event),
		);
		html.find(".rollable").on("mouseover", event =>
			this._onRollableHover(event, true),
		);
		html.find(".rollable").on("mouseout", event =>
			this._onRollableHover(event, false),
		);
		html.find(".rollable").on("click", event => this._onClickRoll(event));

		// Hover Over
		html.find(".item").on("dragleave", event =>
			this._onItemDragLeave(event),
		);
		html.find(".item").on("dragenter", event =>
			this._onItemDragEnter(event),
		);
	}

	protected _resizeInput(event: JQuery.ChangeEvent) {
		event.preventDefault();
		const field = event.currentTarget;
		$(field).css("min-width", field.value.length + "ch");
	}

	protected _onCollapseToggle(event: JQuery.ClickEvent): void {
		event.preventDefault();
		const id: string = $(event.currentTarget).data("item-id");
		const open: boolean = $(event.currentTarget)
			.attr("class")
			?.includes("closed")
			? true
			: false;
		const item = this.actor.deepItems.get(id);
		item?.update({ _id: id, "system.open": open });
	}

	protected async _handlePDF(event: JQuery.ClickEvent): Promise<void> {
		event.preventDefault();
		const pdf = $(event.currentTarget).data("pdf");
		if (pdf) return openPDF(pdf);
	}

	protected async _openItemSheet(event: JQuery.DoubleClickEvent) {
		event.preventDefault();
		const id = $(event.currentTarget).data("item-id");
		const item = this.actor.deepItems.get(id);
		item?.sheet?.render(true);
	}

	protected async _onEquippedToggle(event: JQuery.ClickEvent) {
		event.preventDefault();
		const id = $(event.currentTarget).data("item-id");
		const item = this.actor.deepItems.get(id);
		return item?.update({
			"system.equipped": !(item as EquipmentGURPS).equipped,
		});
	}

	protected async _onRollableHover(
		event: JQuery.MouseOverEvent | JQuery.MouseOutEvent,
		hover: boolean,
	) {
		event.preventDefault();
		if (this.actor.editing) {
			event.currentTarget.classList.remove("hover");
			return;
		}
		if (hover) event.currentTarget.classList.add("hover");
		else event.currentTarget.classList.remove("hover");
	}

	protected async _onClickRoll(event: JQuery.ClickEvent) {
		event.preventDefault();
		if (this.actor.editing) return;
		const type: RollType = $(event.currentTarget).data("type");
		const data: { [key: string]: any } = { type: type };
		if (
			[
				RollType.Damage,
				RollType.Attack,
				RollType.Skill,
				RollType.SkillRelative,
				RollType.Spell,
				RollType.SpellRelative,
			].includes(type)
		)
			data.item = this.actor.deepItems.get(
				$(event.currentTarget).data("item-id"),
			);
		if ([RollType.Damage, RollType.Attack].includes(type))
			data.weapon = data.item.weapons.get(
				$(event.currentTarget).data("attack-id"),
			);
		if (type == RollType.Modifier) {
			data.modifier = $(event.currentTarget).data("modifier");
			data.comment = $(event.currentTarget).data("comment");
		}
		return RollGURPS.handleRoll((game as Game).user, this.actor, data);
	}

	protected async _onItemDragEnter(event: JQuery.DragEnterEvent) {
		event.preventDefault();
		$(".drop-over").removeClass("drop-over");
		const item = $(event.currentTarget).closest(".item.desc");
		const selection = Array.prototype.slice.call(
			item.nextUntil(".item.desc"),
		);
		selection.unshift(item);
		for (const e of selection) $(e).addClass("drop-over");
	}

	protected async _onItemDragLeave(event: JQuery.DragLeaveEvent) {
		event.preventDefault();
	}

	getData(options?: Partial<ActorSheet.Options> | undefined): any {
		const actorData = this.actor.toObject(false) as any;
		const items = deepClone(
			this.actor.items
				.map(item => item as Item)
				//@ts-ignore
				.sort((a: Item, b: Item) => (a.sort ?? 0) - (b.sort ?? 0)),
		);
		const [primary_attributes, secondary_attributes, point_pools] =
			this.prepareAttributes(this.actor.attributes);
		const encumbrance = this.prepareEncumbrance();
		const lifts = this.prepareLifts();
		const sheetData = {
			...super.getData(options),
			...{
				data: actorData.system,
				items: items,
				settings: (actorData.system as any).settings,
				editing: this.actor.editing,
				primary_attributes: primary_attributes,
				secondary_attributes: secondary_attributes,
				point_pools: point_pools,
				encumbrance: encumbrance,
				lifting: lifts,
				current_year: new Date().getFullYear(),
			},
		};
		this.prepareItems(sheetData);
		return sheetData;
	}

	prepareAttributes(
		attributes: Map<string, Attribute>,
	): [Attribute[], Attribute[], Attribute[]] {
		const primary_attributes: Attribute[] = [];
		const secondary_attributes: Attribute[] = [];
		const point_pools: Attribute[] = [];
		if (attributes) {
			for (const a of Object.values(attributes)) {
				if (a.attribute_def?.type.includes("pool")) point_pools.push(a);
				else if (a.attribute_def?.isPrimary) primary_attributes.push(a);
				else secondary_attributes.push(a);
			}
		}
		return [primary_attributes, secondary_attributes, point_pools];
	}

	prepareEncumbrance() {
		const encumbrance = [...this.actor.allEncumbrance];
		for (const e of encumbrance) {
			if (e.level == this.actor.encumbranceLevel().level)
				(e as any).active = true;
		}
		return encumbrance;
	}

	prepareLifts() {
		const lifts = {
			basic_lift: `${this.actor.basicLift} ${this.actor.settings.default_weight_units}`,
			one_handed_lift: `${this.actor.oneHandedLift} ${this.actor.settings.default_weight_units}`,
			two_handed_lift: `${this.actor.twoHandedLift} ${this.actor.settings.default_weight_units}`,
			shove: `${this.actor.shove} ${this.actor.settings.default_weight_units}`,
			running_shove: `${this.actor.runningShove} ${this.actor.settings.default_weight_units}`,
			carry_on_back: `${this.actor.carryOnBack} ${this.actor.settings.default_weight_units}`,
			shift_slightly: `${this.actor.shiftSlightly} ${this.actor.settings.default_weight_units}`,
		};
		return lifts;
	}

	prepareItems(data: any) {
		const [traits, skills, spells, equipment, other_equipment, notes] =
			data.items.reduce(
				(arr: ItemGURPS[][], item: ItemGURPS) => {
					if (
						item instanceof TraitGURPS ||
						item instanceof TraitContainerGURPS
					)
						arr[0].push(item);
					else if (
						item instanceof SkillGURPS ||
						item instanceof TechniqueGURPS ||
						item instanceof SkillContainerGURPS
					)
						arr[1].push(item);
					else if (
						item instanceof SpellGURPS ||
						item instanceof RitualMagicSpellGURPS ||
						item instanceof SpellContainerGURPS
					)
						arr[2].push(item);
					else if (
						item instanceof EquipmentGURPS ||
						item instanceof EquipmentContainerGURPS
					) {
						if (item.other) arr[4].push(item);
						else arr[3].push(item);
					} else if (
						item instanceof NoteGURPS ||
						item instanceof NoteContainerGURPS
					)
						arr[5].push(item);
					return arr;
				},
				[[], [], [], [], [], []],
			);

		const melee: MeleeWeapon[] = this.actor.meleeWeapons;
		const ranged: RangedWeapon[] = this.actor.rangedWeapons;
		const reactions: CondMod[] = this.actor.reactions;
		const conditionalModifiers: CondMod[] = this.actor.conditionalModifiers;

		const carried_value = this.actor.wealthCarried();
		let carried_weight = this.actor.weightCarried(true);

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
		data.reactions = reactions;
		data.conditionalModifiers = conditionalModifiers;
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
			conditional_modifiers: conditionalModifiers,
		};
	}

	// Events
	async _onEditToggle(event: JQuery.ClickEvent) {
		event.preventDefault();
		await this.actor.update({ "system.editing": !this.actor.editing });
		$(event.currentTarget).find("i").toggleClass("fa-unlock fa-lock");
		return this.render();
	}

	protected override _getHeaderButtons(): Application.HeaderButton[] {
		const edit_button = {
			label: "",
			class: "edit-toggle",
			icon: `fas fa-${this.actor.editing ? "un" : ""}lock`,
			onclick: (event: any) => this._onEditToggle(event),
		};
		const buttons: Application.HeaderButton[] = [
			edit_button,
			// {
			// 	label: "",
			// 	class: "attributes",
			// 	icon: "gcs-attribute",
			// 	onclick: event => this._onAttributeSettingsClick(event),
			// },
			// {
			// 	label: "",
			// 	class: "body-type",
			// 	icon: "gcs-body-type",
			// 	onclick: event => this._onBodyTypeSettingsClick(event),
			// },
			{
				label: "",
				// label: "Import",
				class: "import",
				icon: "fas fa-file-import",
				onclick: event => this._onFileImport(event),
			},
			{
				label: "GURPS",
				class: "gmenu",
				icon: "fas fa-dice",
				onclick: event => this._onGMenu(event),
			},
		];
		const all_buttons = buttons.concat(super._getHeaderButtons());
		all_buttons.at(-1)!.label = "";
		all_buttons.at(-1)!.icon = "gcs-circled-x";
		return all_buttons;
		// return buttons.concat(super._getHeaderButtons());
	}

	async _onFileImport(event: any) {
		event.preventDefault();
		this.actor.importCharacter();
	}

	protected async _onGMenu(event: JQuery.ClickEvent) {
		event.preventDefault();
		new CharacterSheetConfig(this.document as CharacterGURPS, {
			top: this.position.top! + 40,
			left:
				this.position.left! +
				(this.position.width! - DocumentSheet.defaultOptions.width!) /
					2,
		}).render(true);
	}
}

export interface CharacterSheetGURPS extends ActorSheetGURPS {
	editing: boolean;
}
