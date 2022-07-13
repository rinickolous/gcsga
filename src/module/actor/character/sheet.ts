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

export class CharacterSheetGURPS extends ActorSheetGURPS {
	static override get defaultOptions(): ActorSheet.Options {
		const options = super.defaultOptions;
		mergeObject(options, {
			width: 700,
			height: 800,
			classes: super.defaultOptions.classes.concat(["character"]),
		});
		return options;
	}

	override get template(): string {
		return `/systems/${SYSTEM_NAME}/templates/actor/character/sheet.hbs`;
	}

	override activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html);
		html.find(".input").on("change", event => this._resizeInput(event));
		html.find(".dropdown-toggle").on("click", event => this._onCollapseToggle(event));
		html.find(".reference").on("click", event => this._handlePDF(event));
		html.find(".item").on("dblclick", event => this._openItemSheet(event));
		html.find(".equipped").on("click", event => this._onEquippedToggle(event));
		html.find(".rollable").on("mouseover", event => this._onRollableHover(event, true));
		html.find(".rollable").on("mouseout", event => this._onRollableHover(event, false));
		html.find(".rollable").on("click", event => this._onClickRoll(event));

		// Hover Over
		html.find(".item").on("dragleave", event => this._onItemDragLeave(event));
		html.find(".item").on("dragenter", event => this._onItemDragEnter(event));
	}

	protected _resizeInput(event: JQuery.ChangeEvent) {
		event.preventDefault();
		const field = event.currentTarget;
		$(field).css("min-width", field.value.length + "ch");
	}

	protected _onCollapseToggle(event: JQuery.ClickEvent): void {
		event.preventDefault();
		const id: string = $(event.currentTarget).data("item-id");
		const open: boolean = $(event.currentTarget).attr("class")?.includes("closed") ? true : false;
		const item = this.actor.deepItems.get(id);
		item?.update({ _id: id, "data.open": open });
	}

	protected async _handlePDF(event: JQuery.ClickEvent): Promise<void> {
		event.preventDefault();
		const pdf = $(event.currentTarget).text();
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
		return item?.update({ "data.equipped": !(item as EquipmentGURPS).equipped });
	}

	protected async _onRollableHover(event: JQuery.MouseOverEvent | JQuery.MouseOutEvent, hover: boolean) {
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
			data.item = this.actor.deepItems.get($(event.currentTarget).data("item-id"));
		if ([RollType.Damage, RollType.Attack].includes(type))
			data.weapon = data.item.weapons.get($(event.currentTarget).data("attack-id"));
		if (type == RollType.Modifier) {
			data.modifier = $(event.currentTarget).data("modifier");
			data.comment = $(event.currentTarget).data("comment");
		}
		return RollGURPS.handleRoll((game as Game).user, this.actor, data);
	}

	protected async _onItemDragEnter(event: JQuery.DragEnterEvent) {
		event.preventDefault();
		// let parent = $(event.currentTarget).parent();
		// if (!parent.hasClass("item-list")) parent = parent.parent();
		// const siblings = Array.prototype.slice.call(parent.children());
		// siblings.forEach(e => e.classList.remove("drop-over"));
		$(".drop-over").removeClass("drop-over");
		const item = $(event.currentTarget).closest(".item.desc");
		const selection = Array.prototype.slice.call(item.nextUntil(".item.desc"));
		selection.unshift(item);
		selection.forEach(e => $(e).addClass("drop-over"));
	}

	protected async _onItemDragLeave(event: JQuery.DragLeaveEvent) {
		event.preventDefault();
		// const item = $(event.currentTarget).closest(".item.desc");
		// const selection = Array.prototype.slice.call(item.nextUntil(".item.desc"));
		// selection.unshift(item);
		// selection.forEach(e => $(e).removeClass("drop-over"));
	}

	getData(options?: Partial<ActorSheet.Options> | undefined): any {
		const actorData = this.actor.toObject(false);
		const items = deepClone(
			this.actor.items.map(item => item).sort((a, b) => (a.data.sort || 0) - (b.data.sort || 0)),
		);
		const [primary_attributes, secondary_attributes, point_pools] = this.prepareAttributes(this.actor.attributes);
		const encumbrance = this.prepareEncumbrance();
		const lifts = this.prepareLifts();
		const sheetData = {
			...super.getData(options),
			...{
				data: actorData.data,
				items: items,
				settings: (actorData.data as any).settings,
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

	prepareAttributes(attributes: Map<string, Attribute>): [Attribute[], Attribute[], Attribute[]] {
		const primary_attributes: Attribute[] = [];
		const secondary_attributes: Attribute[] = [];
		const point_pools: Attribute[] = [];
		if (attributes) {
			attributes.forEach(a => {
				if (a.attribute_def?.type == "pool") point_pools.push(a);
				else if (a.attribute_def?.isPrimary) primary_attributes.push(a);
				else secondary_attributes.push(a);
			});
		}
		return [primary_attributes, secondary_attributes, point_pools];
	}

	prepareEncumbrance() {
		const encumbrance = [...this.actor.allEncumbrance];
		encumbrance.forEach(e => {
			if (e.level == this.actor.encumbranceLevel().level) (e as any).active = true;
		});
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
		const [traits, skills, spells, equipment, other_equipment, notes] = data.items.reduce(
			(arr: ItemGURPS[][], item: ItemGURPS) => {
				if (item instanceof TraitGURPS || item instanceof TraitContainerGURPS) arr[0].push(item);
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
				else if (item instanceof EquipmentGURPS || item instanceof EquipmentContainerGURPS) {
					if (item.other) arr[4].push(item);
					else arr[3].push(item);
				} else if (item instanceof NoteGURPS || item instanceof NoteContainerGURPS) arr[5].push(item);
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
		await this.actor.update({ "data.editing": !this.actor.editing });
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
			{
				label: "Import",
				class: "import",
				icon: "fas fa-file-import",
				onclick: event => this._onFileImport(event),
			},
		];
		return buttons.concat(super._getHeaderButtons());
	}

	async _onFileImport(event: any) {
		event.preventDefault();
		this.actor.importCharacter();
	}
}

export interface CharacterSheetGURPS extends ActorSheetGURPS {
	editing: boolean;
}
