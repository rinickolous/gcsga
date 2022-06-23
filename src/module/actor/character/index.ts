import {
	DocumentModificationOptions,
	Metadata,
} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs";
import { Document } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/module.mjs";
import { ActorDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/actorData";
import { SYSTEM_NAME } from "@module/settings";
import { gid } from "@module/gid";
import { ActorConstructorContextGURPS, ActorGURPS } from "../base";
import { CharacterData, CharacterSource } from "./data";
import { CharacterImporter } from "./import";
import { Attribute, AttributeDef, AttributeSettingDef } from "./attribute";
import { BaseUser } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/documents.mjs";
import { Feature, DRBonus, AttributeBonus, CostReduction, SkillPointBonus, SkillBonus } from "@module/feature";
import { EquipmentModifierGURPS, RitualMagicSpellGURPS, SkillContainerGURPS, SkillGURPS, SpellContainerGURPS, TechniqueGURPS, TraitContainerGURPS, TraitGURPS, TraitModifierGURPS } from "@item";
import { i18n, stringCompare } from "@util";
import { Bonus, Default, DefaultedFrom } from "@module/data";

//@ts-ignore
export class CharacterGURPS extends ActorGURPS {
	variableResolverExclusions: Map<string, boolean> = new Map();
	featureStack: Map<string, Feature> = new Map();

	static get schema(): typeof CharacterData {
		return CharacterData;
	}

	constructor(data: CharacterSource, context: ActorConstructorContextGURPS = {}) {
		super(data, context);
		if (!context.gcsga?.imported) {
			if (!this.data.data.id) this.data.data.id = newUUID();
			if (!this.data.data.created_date) {
				this.data.data.created_date = getCurrentTime();
				this.data.data.modified_date = this.data.data.created_date;
			}
			if (!this.data.data.points.total) this.data.data.points.total = settingsProvider.general_settings.initial_points;
			if (!this.data.data.settings) {
				this.data.data.settings = settingsProvider.sheet_settings;
				this.data.data.attributes = newAttributes(this);
			}
			if (settingsProvider.auto_fill_profile) {
				this.autoFillProfile();
			}
		}
	}

	get settings() {
		return this.data.data.settings;
	}

	// TODO change to array
	get attributes() {
		return this.data.data.attributes;
	}

	get calc() {
		return this.data.data.calc;
	}

	// TODO implement
	get encumbrance_penalty(): number {
		return 0;
	}

	// Get Items
	get traits() {
		return new Collection(
			//@ts-ignore
			this.deepItems
				.filter((i) => i.section == "traits")
				.map((e) => {
					return [e.id!, e];
				}),
		);
	}

	get skills() {
		return new Collection(
			//@ts-ignore
			this.deepItems
				.filter((i) => i.section == "skills")
				.map((e) => {
					return [e.id!, e];
				}),
		);
	}

	get spells() {
		return new Collection(
			//@ts-ignore
			this.deepItems
				.filter((i) => i.section == "spells")
				.map((e) => {
					return [e.id!, e];
				}),
		);
	}

	get equipment() {
		return new Collection(
			//@ts-ignore
			this.deepItems
				.filter((i) => i.section == "equipment")
				.map((e) => {
					return [e.id!, e];
				}),
		);
	}

	get carried_equipment() {
		return new Collection(
			//@ts-ignore
			this.deepItems
				.filter((i) => i.section == "equipment" && !(i as any).data.data.other)
				.map((e) => {
					return [e.id!, e];
				}),
		);
	}

	get other_equipment() {
		return new Collection(
			//@ts-ignore
			this.deepItems
				.filter((i) => i.section == "equipment" && (i as any).data.data.other)
				.map((e) => {
					return [e.id!, e];
				}),
		);
	}

	get notes() {
		return new Collection(
			//@ts-ignore
			this.deepItems
				.filter((i) => i.section == "notes")
				.map((e) => {
					return [e.id!, e];
				}),
		);
	}

	prepareEmbeddedDocuments(): void {
		this.updateSkills();
		this.updateSpells();
		for (let i = 0; i < 5; i++) {
			this.processFeatures();
			this.processPrereqs();
			let skills_changed = this.updateSkills();
			let spells_changed = this.updateSpells();
			if (!skills_changed && !spells_changed) break;
		}
	}

	processFeatures() {
		const featureStack: Map<string, Feature> = new Map();
		for (const t of this.traits.filter(e => !(e instanceof TraitModifierGURPS))) {
			if (t instanceof TraitGURPS) {
				for (const f of t.features) {
					processFeature(t, featureStack, f, Math.max(t.levels, 0));
				}
			}
			for (const f of t.cr_adj.features(t.cr)) {
				this.processFeature(t, featureStack, f, Math.max(t.levels, 0));
			}
			for (const m of t.modifiers) {
				for (const f of m.features) {
					processFeature(t, featureStack, f, m.levels);
				}
			}
		}
		for (const s of this.skills.filter(e => !(e instanceof SkillContainerGURPS))) {
			for (const f of s.features) {
				processFeature(s, featureStack, f, 0);
			}
		}
		for (const e of this.equipment.filter(e => !(e instanceof EquipmentModifierGURPS))) {
			for (const f of t.features) {
				processFeature(t, featureStack, f, Math.max(e.levels, 0));
			}
			for (const m of e.modifiers) {
				for (const f of m.features) {
					processFeature(e, featureStack, f, m.levels);
				}
			}
		}
		this.featureStack = featureStack;
		this.lifting_st_bonus = this.bonusFor(`${Feature.attrID_prefix}${GID.strength}.${Attribute.lifting_only}`, null);
		this.striking_st_bonus = this.bonusFor(`${Feature.attrID_prefix}${GID.strength}.${Attribute.striking_only}`, null);
		this.throwing_st_bonus = this.bonusFor(`${Feature.attrID_prefix}${GID.strength}.${Attribute.throwing_only}`, null);
		for (const attr of this.attributes) {
			const def = attr.attributeDef();
			if (def) {
				const attrID = Feature.attrID_prefix + attr.attr_id;
				attr.bonus = this.bonusFor(attrID, null);
				if (def.type != "decimal") attr.bonus = Math.floor(attr.bonus);
				attr.cost_reduction = this.costReductionFor(attrID);
			} else {
				attr.bonus = 0;
				attr.cost_reduction = 0;
			}
		}
		this.updateProfile();
		this.dodge_bonus = this.bonusFor(`${Feature.attrID_prefix}${GID.dodge}`, null);
		this.parry_bonus = this.bonusFor(`${Feature.attrID_prefix}${GID.parry}`, null);
		this.block_bonus = this.bonusFor(`${Feature.attrID_prefix}${GID.block}`, null);
	}

	processPrereqs(): void {
		const prefix = "\n● "
		const  not_met = i18n("gcsga.prerqs.not_met");
		for (const t of this.traits.filter(e => e instanceof TraitMGURPS) {
			t.unsatisfied_reason = "";
			if (!t.prereqsEmpty) {
				const tooltip = new TooltipGURPS();
				if (!t.prereqsSatisfied(this, toolip, prefix)) {
					t.unsatisfied_reason = not_met + tooltip.toString();
				}
			}
		}
		for (const k of this.skills.filter(e => !(e instanceof SkillContainerGURPS))) {
			k.unsatisfied_reason = "";
			const tooltip = new TooltipGURPS();
			let satisfied = true;
			if (!k.prereqsEmpty) satisfied = k.prereqsSatisfied(this, tooltip, prefix);
			if (satisfied && k instanceof TechniqueGURPS) satisfied = k.techniqueSatisfied(tooltip, prefix);
			if (!satisfied) {
				k.unsatisfied_reason = not_met + tooltip.toString();
			}
		}
		for (const b of this.spells.filter(e => !(e instanceof SpellContainerGURPS))) {
			b.unsatisfied_reason = "";
			const tooltip = new TooltipGURPS();
			let satisfied = true;
			if (!b.prereqsEmpty) satisfied = b.prereqsSatisfied(this, tooltip, prefix);
			if (satisfied && b instanceof RitualMagicSpellGURPS) satisfied = b.ritualMagicSatisfied(tooltip, prefix);
			if (!satisfied) b.unsatisfied_reason = not_met + tooltip.toString();
		}
		for (const e of this.equipment.filter(e => !(e instanceof EquipmentModifierGURPS))) {
			e.unsatisfied_reason = "";
			if (!e.prereqsEmpty) {
				const tooltip = new TooltipGURPS();
				if (!e.prereqsSatisfied(this, tooltip, prefix)) {
					e.unsatisfied_reason = not_met + tooltip.toString();
				}
			}
		}
	}

	updateSkills(): boolean {
		let changed = false;
		for (const k of this.skills.filter(e => !(e instanceof SkillContainerGURPS))) {
			if (k.updateLevel()) changed = true;
		}
		return changed;
	}

	updateSpells(): boolean {
		let changed = false;
		for (const b of this.spells.filter(e => !(e instanceof SkillContainerGURPS))) {
			if (b.updateLevel()) changed = true;
		}
		return changed;
	}

	// /** @override */
	// protected _preUpdate(
	// 	changed: DeepPartial<ActorDataConstructorData>,
	// 	options: DocumentModificationOptions,
	// 	user: BaseUser,
	// ): Promise<void> {
	// 	console.log(changed, options);
	// 	if ((changed as any)["data.atributes"])
	// 		for (let [k, v] of Object.entries((changed.data as any).attributes)) {
	// 			(v as any).adj =
	// 				Math.round(((v as any).calc.value - this.resolveAttributeDef(k) - this.getAttBonus(k)) * 10000) /
	// 				10000;
	// 		}
	// 	return super._preUpdate(changed, options, user);
	// }
	//
	// /** @override */
	// update(
	// 	data?: DeepPartial<ActorDataConstructorData | (ActorDataConstructorData & Record<string, unknown>)>,
	// 	context?: DocumentModificationContext & foundry.utils.MergeObjectOptions,
	// ): Promise<this | undefined> {
	// 	return super.update(data, context);
	// }
	//
	// /** @override */
	// prepareBaseData() {
	// 	super.prepareBaseData();
	// }
	//
	// /** @override */
	// prepareData() {
	// 	super.prepareData();
	// }
	//
	// /** @override */
	// prepareEmbeddedDocuments() {
	// 	super.prepareEmbeddedDocuments();
	// 	this.featureStack = [];
	// 	this.deepItems.forEach((item) => {
	// 		if (item.features.length && item.enabled)
	// 			item.features.forEach((f) => {
	// 				if (f.per_level && ["trait", "modifier"].includes(item.type)) f.levels = (item as any).levels;
	// 				this.featureStack?.push(f);
	// 			});
	// 	});
	// 	this.prepareAttributes();
	// 	this.prepareDR();
	// 	this.prepareSkills();
	// 	this.prepareSpells();
	// 	for (let i = 0; i < 5; i++) {
	// 		this.processFeatures();
	// 		this.processPrereqs();
	// 		let skillsChanged = this.prepareSkills();
	// 		let spellsChanged = this.prepareSpells();
	// 		if (!skillsChanged && !spellsChanged) break;
	// 	}
	// }
	//
	// processFeatures() {
	// 	this.featureStack = [];
	// 	for (const i of this.traits) {
	// 		if (i instanceof TraitGURPS) {
	// 			if (i.features) for (const f of i.features) {
	// 				this.processFeature(i, f, Math.max(i.levels, 0))
	// 			}
	// 		}
	// 		for (const f of i.cr_adj.features())
	// 	}
	// }
	//
	// prepareAttributes() {
	// 	const attributes = this.data.data.attributes;
	// 	if (!attributes) return;
	// 	const defs = this.settings.attributes;
	// 	for (let [k, att] of Object.entries(attributes)) {
	// 		att.calc.value = this.resolveAttributeDef(k) + att.adj;
	// 		att.calc.value += this.getAttBonus(k);
	// 		const cost_multiplier = 1 - this.getAttCostReduction(k) * Math.max(this.data.data.profile.SM, 0);
	// 		att.calc.points = att.adj * (defs[k].cost_per_point * cost_multiplier);
	// 	}
	// }
	//
	// getAttBonus(att: string): number {
	// 	let bonus = 0;
	// 	for (const feature of this.featureStack.filter((f) => f.type == "attribute_bonus") as AttributeBonus[]) {
	// 		if (feature.attribute == att) bonus += feature.calc_amount;
	// 	}
	// 	return bonus;
	// }
	//
	// getAttCostReduction(att: string): number {
	// 	let reduction = 0;
	// 	reduction += this.settings.attributes[att].cost_adj_percent_per_sm ?? 0;
	// 	for (const feature of this.featureStack.filter((f) => f.type == "cost_reduction") as CostReduction[]) {
	// 		if (feature.attribute == att) reduction += feature.calc_amount;
	// 	}
	// 	reduction *= 0.01;
	// 	return Math.min(reduction, 0.8);
	// }
	//
	// prepareDR() {
	// 	const hit_locations = this.data.data.settings.hit_locations;
	// 	if (!hit_locations) return;
	// 	for (const location of hit_locations.locations) {
	// 		location.calc.dr = { all: location.dr_bonus };
	// 	}
	// 	for (const feature of this.featureStack.filter((f) => f.type == "dr_bonus") as DRBonus[]) {
	// 		for (const location of hit_locations.locations.filter((e) => e.id == feature.location)) {
	// 			const spec = feature.specialization ?? "all";
	// 			if (!location.calc.dr[spec]) location.calc.dr[spec] = 0;
	// 			location.calc.dr[spec] += feature.calc_amount
	// 		}
	// 	}
	// 	console.log("done", this.data.data.settings.hit_locations, hit_locations);
	// }
	//
	// prepareSkills() {
	// 	const skills = this.skills;
	// 	if (!skills) return;
	// 	(skills as Collection<SkillGURPS | SkillContainerGURPS | TechniqueGURPS>).forEach((skill) => {
	// 		if (skill instanceof SkillContainerGURPS) return;
	// 		if (skill instanceof SkillGURPS) {
	// 			skill.data.data.defaulted_from = skill.bestDefaultWithPoints(this, null);
	// 			skill.level = this.calculateSkillLevel(skill);
	// 			skill.data.data.defaulted_from
	// 		}
	// 	});
	// }
	//
	// calculateSkillLevel(skill: SkillGURPS): SkillGURPS["level"] {
	// 	const def = skill.data.data.defaulted_from;
	// 	let points = skill.points ?? 0;
	// 	let relative_level = SkillGURPS.baseRelativeLevel(skill.difficulty);
	// 	let level = this.attributes[skill.attribute]?.calc?.value ?? Math.max();
	// 	if (level != Math.max()) {
	// 		if (skill.difficulty == "w") {
	// 			points /= 3;
	// 		} else if (def && def.points > 0){
	// 			points += def.points;
	// 		}
	// 		points = Math.floor(points);
	// 		if (points == 1) {
	// 			// relative_level is preset to this point value
	// 		} else if (points > 1 && points < 4) {
	// 			relative_level += 1;
	// 		} else if (points > 4) {
	// 			relative_level += 1 + Math.floor(points/4);
	// 		} else if (skill.difficulty != "w" && !!def && def.points < 0) {
	// 			relative_level = def.adjusted_level - level;
	// 		} else {
	// 			level = Math.max();
	// 			relative_level = 0;
	// 		}
	// 	}
	// 	if (level != Math.max()) {
	// 		level += relative_level;
	// 		if (skill.difficulty != "w" && !!def && level < def.adjusted_level) {
	// 			level = def.adjusted_level;
	// 		}
	// 		let [bonus, tooltip] = this.skillComparedBonusFor(skill);
	// 		level += bonus;
	// 		relative_level += bonus;
	// 		bonus = this.encumbrance_penalty * skill.encumbrance_penalty_multiplier;
	// 		level += bonus;
	// 		relative_level += bonus;
	// 		if (bonus != 0) {
	// 			tooltip.push({name: i18n("gcsga.encumbrance"), amount: bonus});
	// 		}
	// 	}
	// 	return {
	// 		level: level,
	// 		relative_level: relative_level,
	// 		tooltip: tooltip,
	// 	};
	// }
	//
	// skillComparedBonusFor(skill: SkillGURPS): [number, Bonus[]] {
	// 	let total = 0;
	// 	let tooltip: Bonus[] = [];
	// 	for (const feature of this.featureStack.filter((f) => f.type == "skill_bonus") as SkillBonus[]) {
	// 		if (stringCompare(skill.name, feature.name) &&
	// 			stringCompare(skill.data.data.specialization, feature.specialization,) &&
	// 			stringCompare(skill.data.data.tags, feature.tags)
	// 		) {
	// 			total += feature.calc_amount;
	// 			const exists = tooltip.find(e => e.name == feature.item);
	// 			if (exists) exists.amount += feature.calc_amount;
	// 			else tooltip.push({name: feature.item ?? "Error", amount: feature.calc_amount});
	// 			
	// 		}
	// 	}
	// 	return [total, tooltip];
	// }
	//
	// /** @override */
	// prepareDerivedData() {
	// 	super.prepareDerivedData();
	// 	// console.log(this.traits);
	// 	// if (this.attributes)
	// 	// 	for (const [k, a] of Object.entries(this.attributes)) {
	// 	// 		a.calc.value = this.resolveAttributeDef(k) + a.adj;
	// 	// 		a.calc.points = Math.ceil(a.adj * this.settings.attributes[k].cost_per_point);
	// 	// 	}
	// 	// const st = this.attributes.st.calc.value;
	// 	// this.calc.basic_lift = `${st >= Math.sqrt(50) ? Math.round(st ** 2 / 5) : st ** 2 / 5} lb`;
	// }
	//
	// /** @override */
	// updateEmbeddedDocuments(
	// 	embeddedName: string,
	// 	updates?: Record<string, unknown>[] | undefined,
	// 	context?: DocumentModificationContext | undefined,
	// ): Promise<Document<any, any, Metadata<any>>[]> {
	// 	return super.updateEmbeddedDocuments(embeddedName, updates, context);
	// }
	//
	// async importCharacter() {
	// 	const import_path = this.getData().import.path;
	// 	const import_name = import_path.match(/.*[/\\]Data[/\\](.*)/);
	// 	if (!!import_name) {
	// 		const file_path = import_name[1].replace(/\\/g, "/");
	// 		const request = new XMLHttpRequest();
	// 		request.open("GET", file_path);
	//
	// 		new Promise((resolve) => {
	// 			request.onload = () => {
	// 				if (request.status === 200) {
	// 					const text = request.response;
	// 					CharacterImporter.import(this, { text: text, name: import_name[1], path: import_path });
	// 				} else this._openImportDialog();
	// 				resolve(this);
	// 			};
	// 		});
	// 		request.send(null);
	// 	} else this._openImportDialog();
	// }
	//
	// _openImportDialog() {
	// 	setTimeout(async () => {
	// 		new Dialog(
	// 			{
	// 				title: `Import character data for: ${this.name}`,
	// 				content: await renderTemplate(`systems/${SYSTEM_NAME}/templates/actor/import.hbs`, {
	// 					name: `"${this.name}"`,
	// 				}),
	// 				buttons: {
	// 					import: {
	// 						icon: `<i class="fas fa-file-import"></i>`,
	// 						label: `Import`,
	// 						callback: (html) => {
	// 							const form = $(html).find("form")[0];
	// 							const files = form.data.files;
	// 							if (!files.length) {
	// 								return ui.notifications?.error("You did not upload a data file!");
	// 							} else {
	// 								const file = files[0];
	// 								readTextFromFile(file).then((text) =>
	// 									CharacterImporter.import(this, {
	// 										text: text,
	// 										name: file.name,
	// 										path: file.path,
	// 									}),
	// 								);
	// 							}
	// 						},
	// 					},
	// 					no: {
	// 						icon: `<i class="fas fa-times"></i>`,
	// 						label: `Cancel`,
	// 					},
	// 				},
	// 				default: "import",
	// 			},
	// 			{
	// 				width: 400,
	// 			},
	// 		).render(true);
	// 	}, 200);
	// }
	//
	// resolveVariable(variableName: string): string {
	// 	if (this.variableResolverExclusions.get(variableName)) {
	// 		console.warn(`Attempt to resolve variable via itself: $${variableName}`);
	// 		return "";
	// 	}
	// 	if (!this.variableResolverExclusions) this.variableResolverExclusions = new Map();
	// 	this.variableResolverExclusions.set(variableName, true);
	// 	if (gid.SizeModifier == variableName) return this.getData().profile.SM.signedString();
	// 	const parts = variableName.split("."); // TODO check
	// 	const attr = this.getData().attributes[parts[0]];
	// 	if (!attr) {
	// 		console.warn(`No such variable: $${variableName}`);
	// 		return "";
	// 	}
	// 	const def = this.getData().settings.attributes[attr.attr_id];
	// 	if (!def) {
	// 		console.warn(`No such variable definition: $${variableName}`);
	// 		return "";
	// 	}
	// 	if (def.type == "pool" && parts.length > 1) {
	// 		switch (parts[1]) {
	// 			case "current":
	// 				return attr.calc.current!.toString();
	// 			case "maximum":
	// 				return attr.calc.value.toString();
	// 			default:
	// 				console.warn(`No such variable: $${variableName}`);
	// 				return "";
	// 		}
	// 	}
	// 	this.variableResolverExclusions = new Map();
	// 	return attr.calc.value!.toString();
	// }
	//
	// resolveAttributeDef(attrID: string): any {
	// 	const systemData = this.data.data;
	// 	if (systemData.attributes[attrID]) this.variableResolverExclusions = new Map();
	// 	return new Attribute(systemData.settings.attributes[attrID] as AttributeDef & AttributeSettingDef).BaseValue(
	// 		this,
	// 	);
	// }
}

export function processFeature(parent: any, m: Map<string, Feature[]>, f: Feature, levels: number): void {
	let key = f.key;
	let list = m.get(key);
	let bonus = f.bonus();
	if (bonus) {
		bonus.setParent(parent);
		bonus.setLevel(levels);
	}
	list!.push(f);
	m.set(key, list!);
}

export interface CharacterGURPS {
	readonly data: CharacterData;
}
