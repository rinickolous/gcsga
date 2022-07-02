import { BaseActorGURPS } from "@actor/base";
import { ActorConstructorContextGURPS } from "@actor/base";
import { ActorImporter } from "@actor/import";
import { Feature } from "@feature";
import { CostReduction } from "@feature/cost_reduction";
import { SkillBonus } from "@feature/skill_bonus";
import { SkillPointBonus } from "@feature/skill_point_bonus";
import { SpellBonus } from "@feature/spell_bonus";
import {
	EquipmentContainerGURPS,
	EquipmentGURPS,
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
import { CR_Features } from "@item/trait/data";
import { DocumentModificationOptions } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs";
import { ActorDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/actorData";
import { Attribute, AttributeObj } from "@module/attribute";
import { AttributeDef } from "@module/attribute/attribute_def";
import { ThresholdOp } from "@module/attribute/pool_threshold";
import { attrPrefix, gid } from "@module/data";
import { SETTINGS_TEMP, SYSTEM_NAME } from "@module/settings";
import { SkillDefault } from "@module/skill-default";
import { TooltipGURPS } from "@module/tooltip";
import { getCurrentTime, i18n, newUUID, stringCompare } from "@util";
import { CharacterDataGURPS, CharacterSource, CharacterSystemData, Encumbrance } from "./data";

class CharacterGURPS extends BaseActorGURPS {
	attributes: Map<string, Attribute> = new Map();
	variableResolverExclusions: Map<string, boolean> = new Map();
	featureMap: Map<string, Feature[]> = new Map();

	constructor(data: CharacterSource, context: ActorConstructorContextGURPS = {}) {
		super(data, context);
		if (this.data.data.attributes) this.attributes = this.getAttributes();
	}

	protected _onCreate(data: any, options: DocumentModificationOptions, userId: string): void {
		const sd: CharacterSystemData | any = {
			id: newUUID(),
			created_date: getCurrentTime(),
			total_points: SETTINGS_TEMP.general.initial_points,
			settings: SETTINGS_TEMP.sheet,
			calc: {
				swing: "",
				thrust: "",
				basic_lift: "0 lb",
				lifting_st_bonus: 0,
				striking_st_bonus: 0,
				throwing_st_bonus: 0,
				move: [0, 0, 0, 0, 0],
				dodge: [0, 0, 0, 0, 0],
				dodge_bonus: 0,
				block_bonus: 0,
				parry_bonus: 0,
			},
		};
		sd.total_points = SETTINGS_TEMP.general.initial_points;
		sd.settings = SETTINGS_TEMP.sheet;
		sd.modified_date = sd.created_date;
		if (SETTINGS_TEMP.general.auto_fill) sd.profile = SETTINGS_TEMP.general.auto_fill;
		sd.atributes = this.newAttributes();
		this.update({ _id: this.data._id, data: sd });
		super._onCreate(data, options, userId);
	}

	override update(
		data?: DeepPartial<ActorDataConstructorData | (ActorDataConstructorData & Record<string, unknown>)>,
		context?: DocumentModificationContext & foundry.utils.MergeObjectOptions,
	): Promise<this | undefined> {
		data = this.updateAttributes(data);
		data = this.checkImport(data);
		return super.update(data, context);
	}

	checkImport(data?: any) {
		for (const i in data) {
			if (i.includes("data.import")) return data;
		}
		data["data.modified_date"] = new Date().toISOString();
		return data;
	}

	updateAttributes(
		data?: DeepPartial<ActorDataConstructorData | (ActorDataConstructorData & Record<string, unknown>)>,
	) {
		if (Object.keys(this.data.data.attributes).length == 0) (data as any)["data.attributes"] = this.newAttributes();
		for (const i in data) {
			if (i.includes("data.attributes.")) {
				const att = this.attributes.get(i.split("attributes.")[1].split(".")[0]);
				const type = i.split("attributes.")[1].split(".")[1];
				if (att) {
					if (type == "adj") (data as any)[i] -= att.max - att.adj;
					else if (type == "damage") (data as any)[i] -= att.current - (att.damage ?? 0);
				}
			}
		}
		return data;
	}

	// Getters
	get profile() {
		return this.data.data.profile;
	}

	get importData(): this["data"]["data"]["import"] {
		return this.data.data.import;
	}

	get calc() {
		return this.data.data.calc;
	}

	// Points
	get totalPoints(): number {
		return this.data.data.total_points;
	}
	set totalPoints(v: number) {
		this.data.data.total_points = v;
	}

	get spentPoints(): number {
		let total = this.attributePoints;
		const [ad, disad, race, quirk] = this.traitPoints;
		total += ad + disad + race + quirk;
		total += this.skillPoints;
		total += this.spellPoints;
		return total;
	}

	get unspentPoints(): number {
		return this.totalPoints - this.spentPoints;
	}
	set unspentPoints(v: number) {
		if (v != this.unspentPoints) this.totalPoints = v - this.spentPoints;
	}

	get attributePoints(): number {
		let total = 0;
		this.attributes.forEach((a: Attribute) => {
			total += a.points;
		});
		return total;
	}

	get traitPoints(): [number, number, number, number] {
		let [ad, disad, race, quirk] = [0, 0, 0, 0];
		for (const t of this.traits) {
			let [a, d, r, q] = t.calculatePoints();
			ad += a;
			disad += d;
			race += r;
			quirk += q;
		}
		return [ad, disad, race, quirk];
	}

	get skillPoints(): number {
		let total = 0;
		for (const s of this.skills.filter(e => e instanceof SkillGURPS || e instanceof TechniqueGURPS) as Array<
			SkillGURPS | TechniqueGURPS
		>) {
			total += s.points ?? 0;
		}
		return total;
	}

	get spellPoints(): number {
		let total = 0;
		for (const s of this.spells.filter(e => e instanceof SpellGURPS || e instanceof RitualMagicSpellGURPS) as Array<
			SpellGURPS | RitualMagicSpellGURPS
		>) {
			total += s.points ?? 0;
		}
		return total;
	}

	get currentMove() {
		return this.move(this.encumbranceLevel(true));
	}

	get currentDodge() {
		return this.dodge(this.encumbranceLevel(true));
	}

	move(enc: Encumbrance): number {
		let initialMove = Math.max(0, this.resolveAttributeCurrent(gid.BasicMove));
		const divisor = 2 * Math.min(this.countThresholdOpMet("halve_move", this.attributes), 2);
		if (divisor > 0) initialMove = Math.ceil(initialMove / divisor);
		const move = Math.trunc((initialMove * (10 + 2 * enc.penalty)) / 10);
		if (move < 1) {
			if (initialMove > 0) return 1;
			return 0;
		}
		return move;
	}

	dodge(enc: Encumbrance): number {
		let dodge = 3 + this.calc?.dodge_bonus + Math.max(this.resolveAttributeCurrent(gid.BasicSpeed), 0);
		const divisor = 2 * Math.min(this.countThresholdOpMet("halve_dodge", this.attributes), 2);
		if (divisor > 0) {
			dodge = Math.ceil(dodge / divisor);
		}
		return Math.floor(Math.max(dodge + enc.penalty, 1));
	}
	countThresholdOpMet(op: ThresholdOp, attributes: Map<string, Attribute>) {
		let total = 0;
		attributes.forEach(a => {
			const threshold = a.currentThreshold;
			if (threshold && threshold.ops.includes(op)) total++;
		});
		return total;
	}

	get settings() {
		let settings = this.data.data.settings;
		const defs: Record<string, AttributeDef> = {};
		for (const att in settings.attributes) {
			defs[att] = new AttributeDef(settings.attributes[att]);
		}
		(settings as any).attributes = defs;
		return settings;
	}

	get adjustedSizeModifier(): number {
		return (this.profile?.SM ?? 0) + this.size_modifier_bonus;
	}

	get created_date(): string {
		return this.data.data.created_date;
	}

	get modified_date(): string {
		return this.data.data.created_date;
	}

	get basicLift(): number {
		return (this.resolveAttributeCurrent(gid.Strength) + this.calc?.lifting_st_bonus) ** 2 / 5;
	}

	encumbranceLevel(for_skills = true): Encumbrance {
		const carried = this.weightCarried(for_skills);
		for (const e of this.allEncumbrance) {
			if (carried <= e.maximum_carry) return e;
		}
		return this.allEncumbrance[this.allEncumbrance.length - 1];
	}

	weightCarried(for_skills: boolean): number {
		let total = 0;
		this.carried_equipment.forEach(e => {
			if (e.parent == this) total += e.extendedWeight(for_skills, this.settings.default_weight_units);
		});
		return total;
	}

	wealthCarried(): number {
		let value = 0;
		this.carried_equipment.forEach(e => {
			if (e.parent == this) value += e.extendedValue;
		});
		return value;
	}

	get allEncumbrance(): Encumbrance[] {
		const bl = this.basicLift;
		const ae: Encumbrance[] = [
			{ level: 0, maximum_carry: bl * 1, penalty: 0, name: i18n("gcsga.character.encumbrance.0") },
			{ level: 1, maximum_carry: bl * 2, penalty: -1, name: i18n("gcsga.character.encumbrance.1") },
			{ level: 2, maximum_carry: bl * 3, penalty: -2, name: i18n("gcsga.character.encumbrance.2") },
			{ level: 3, maximum_carry: bl * 6, penalty: -3, name: i18n("gcsga.character.encumbrance.3") },
			{ level: 4, maximum_carry: bl * 10, penalty: -4, name: i18n("gcsga.character.encumbrance.4") },
		];
		return ae;
	}

	// Bonuses
	get size_modifier_bonus(): number {
		return this.bonusFor(attrPrefix + gid.SizeModifier, null);
	}

	get striking_st_bonus(): number {
		return this.data.data.calc.striking_st_bonus;
	}
	set striking_st_bonus(v: number) {
		this.data.data.calc.striking_st_bonus = v;
	}

	get lifting_st_bonus(): number {
		return this.calc.lifting_st_bonus;
	}
	set lifting_st_bonus(v: number) {
		this.calc.lifting_st_bonus = v;
	}

	get throwing_st_bonus(): number {
		return this.data.data.calc.throwing_st_bonus;
	}
	set throwing_st_bonus(v: number) {
		this.data.data.calc.throwing_st_bonus = v;
	}

	// Item Types
	get traits(): Collection<TraitGURPS | TraitContainerGURPS> {
		const traits: Collection<TraitGURPS | TraitContainerGURPS> = new Collection();
		this.deepItems.forEach(item => {
			if (item instanceof TraitGURPS || item instanceof TraitContainerGURPS) traits.set(item.data._id!, item);
		});
		return traits;
	}

	get skills(): Collection<SkillGURPS | TechniqueGURPS | SkillContainerGURPS> {
		const skills: Collection<SkillGURPS | TechniqueGURPS | SkillContainerGURPS> = new Collection();
		this.deepItems.forEach(item => {
			if (item instanceof SkillGURPS || item instanceof TechniqueGURPS || item instanceof SkillContainerGURPS)
				skills.set(item.data._id!, item);
		});
		return skills;
	}

	get spells(): Collection<SpellGURPS | RitualMagicSpellGURPS | SpellContainerGURPS> {
		const spells: Collection<SpellGURPS | RitualMagicSpellGURPS | SpellContainerGURPS> = new Collection();
		this.deepItems.forEach(item => {
			if (
				item instanceof SpellGURPS ||
				item instanceof RitualMagicSpellGURPS ||
				item instanceof SpellContainerGURPS
			)
				spells.set(item.data._id!, item);
		});
		return spells;
	}

	get equipment(): Collection<EquipmentGURPS | EquipmentContainerGURPS> {
		const equipment: Collection<EquipmentGURPS | EquipmentContainerGURPS> = new Collection();
		this.deepItems.forEach(item => {
			if (item instanceof EquipmentGURPS || item instanceof EquipmentContainerGURPS)
				equipment.set(item.data._id!, item);
		});
		return equipment;
	}

	get carried_equipment(): Collection<EquipmentGURPS | EquipmentContainerGURPS> {
		return new Collection(
			this.equipment
				.filter(item => !item.other)
				.map(item => {
					return [item.data._id!, item];
				}),
		);
	}

	get other_equipment(): Collection<EquipmentGURPS | EquipmentContainerGURPS> {
		return new Collection(
			this.equipment
				.filter(item => item.other)
				.map(item => {
					return [item.data._id!, item];
				}),
		);
	}

	get notes(): Collection<NoteGURPS | NoteContainerGURPS> {
		const notes: Collection<NoteGURPS | NoteContainerGURPS> = new Collection();
		this.deepItems.forEach(item => {
			if (item instanceof NoteGURPS || item instanceof NoteContainerGURPS) notes.set(item.data._id!, item);
		});
		return notes;
	}

	//TODO changed
	get reactions(): Collection<any> {
		return new Collection();
	}

	get conditional_modifiers(): Collection<any> {
		return new Collection();
	}

	newAttributes(): Record<string, AttributeObj> {
		const a: Record<string, AttributeObj> = {};
		let i = 0;
		for (const attr_id in this.data.data.settings.attributes) {
			const attr = new Attribute(this, attr_id, i);
			a[attr_id] = {
				bonus: attr.bonus,
				cost_reduction: attr.cost_reduction,
				order: attr.order,
				attr_id: attr.attr_id,
				adj: attr.adj,
			};
			if (!!attr.damage) a[attr_id]["damage"] = attr.damage;
			i++;
		}
		return a;
	}

	getAttributes(): Map<string, Attribute> {
		const a: Map<string, Attribute> = new Map();
		let i = 0;
		for (const attr_id in this.data.data.attributes) {
			let att = this.data.data.attributes[attr_id];
			a.set(attr_id, new Attribute(this, attr_id, i, att));
			i++;
		}
		return a;
	}

	// Prepare data
	override prepareData(): void {
		super.prepareData();
	}

	override prepareBaseData(): void {
		super.prepareBaseData();
		if (this.data?.data?.attributes && Object.keys(this.data.data.attributes).length == 0) {
			this.data.data.attributes = this.newAttributes();
			this.attributes = this.getAttributes();
		}
	}

	override prepareEmbeddedDocuments(): void {
		super.prepareEmbeddedDocuments();
		this.updateSkills();
		this.updateSpells();
		for (let i = 0; i < 5; i++) {
			this.processFeatures();
			this.processPrereqs();
			let skillsChanged = this.updateSkills();
			let spellsChanged = this.updateSpells();
			if (!skillsChanged && !spellsChanged) break;
		}
	}

	updateProfile(): void {
		if (this.profile) this.profile.SM = this.bonusFor(`${attrPrefix}${gid.SizeModifier}`, null);
	}

	processFeatures() {
		const featureMap: Map<string, Feature[]> = new Map();
		for (const t of this.traits) {
			if (t instanceof TraitGURPS) {
				if (t.features)
					for (const f of t.features) {
						processFeature(t, featureMap, f, Math.max(t.levels, 0));
					}
			}
			if (CR_Features.has(t.crAdj))
				for (const f of CR_Features?.get(t.crAdj)) {
					processFeature(t, featureMap, f, Math.max(t.levels, 0));
				}
			for (const m of t.modifiers) {
				for (const f of m.features) {
					processFeature(t, featureMap, f, m.levels);
				}
			}
		}
		for (const s of this.skills) {
			if (!(s instanceof SkillContainerGURPS))
				for (const f of s.features) {
					processFeature(s, featureMap, f, 0);
				}
		}
		for (const e of this.equipment) {
			for (const f of e.features) {
				processFeature(e, featureMap, f, 0);
			}
			for (const m of e.modifiers) {
				for (const f of m.features) {
					processFeature(e, featureMap, f, 0);
				}
			}
		}
		this.featureMap = featureMap;
		if (this.calc) this.lifting_st_bonus = this.bonusFor(`${attrPrefix}${gid.Strength}.lifting_only`, null);
		if (this.calc) this.striking_st_bonus = this.bonusFor(`${attrPrefix}${gid.Strength}.striking_only`, null);
		if (this.calc) this.throwing_st_bonus = this.bonusFor(`${attrPrefix}${gid.Strength}.throwing_only`, null);
		if (this.attributes) {
			this.attributes.forEach(attr => {
				const def = attr.attribute_def;
				if (def) {
					const attrID = attrPrefix + attr.attr_id;
					this.data.data.attributes[attr.attr_id].bonus = this.bonusFor(attrID, null);
					if (def.type != "decimal") attr.bonus = Math.floor(attr.bonus);
					this.data.data.attributes[attr.attr_id].cost_reduction = this.costReductionFor(attrID);
				} else {
					this.data.data.attributes[attr.attr_id].bonus = 0;
					this.data.data.attributes[attr.attr_id].cost_reduction = 0;
				}
			});
		}
		this.attributes = this.getAttributes();
		this.updateProfile();
		if (this.calc) this.calc.dodge_bonus = this.bonusFor(`${attrPrefix}${gid.Dodge}`, null);
		if (this.calc) this.calc.parry_bonus = this.bonusFor(`${attrPrefix}${gid.Parry}`, null);
		if (this.calc) this.calc.block_bonus = this.bonusFor(`${attrPrefix}${gid.Block}`, null);
	}

	processPrereqs(): void {
		const prefix = "\n● ";
		const not_met = i18n("gcsga.prerqs.not_met");
		for (const t of this.traits.filter(e => e instanceof TraitGURPS)) {
			t.unsatisfied_reason = "";
			if (t instanceof TraitGURPS && !t.prereqsEmpty) {
				const tooltip = new TooltipGURPS();
				if (!t.prereqs.satisfied(this, t, tooltip, prefix)) {
					t.unsatisfied_reason = not_met + tooltip.toString();
				}
			}
		}
		for (let k of this.skills.filter(e => !(e instanceof SkillContainerGURPS))) {
			k = k as SkillGURPS | TechniqueGURPS;
			k.unsatisfied_reason = "";
			const tooltip = new TooltipGURPS();
			let satisfied = true;
			if (!k.prereqsEmpty) satisfied = k.prereqs.satisfied(this, k, tooltip, prefix);
			if (satisfied && k instanceof TechniqueGURPS) satisfied = k.satisfied(tooltip, prefix);
			if (!satisfied) {
				k.unsatisfied_reason = not_met + tooltip.toString();
			}
		}
		for (let b of this.spells.filter(e => !(e instanceof SpellContainerGURPS))) {
			b = b as SpellGURPS | RitualMagicSpellGURPS;
			b.unsatisfied_reason = "";
			const tooltip = new TooltipGURPS();
			let satisfied = true;
			if (!b.prereqsEmpty) satisfied = b.prereqs.satisfied(this, b, tooltip, prefix);
			if (satisfied && b instanceof RitualMagicSpellGURPS) satisfied = b.satisfied(tooltip, prefix);
			if (!satisfied) b.unsatisfied_reason = not_met + tooltip.toString();
		}
		for (const e of this.equipment) {
			e.unsatisfied_reason = "";
			if (!e.prereqsEmpty) {
				const tooltip = new TooltipGURPS();
				if (!e.prereqs.satisfied(this, e, tooltip, prefix)) {
					e.unsatisfied_reason = not_met + tooltip.toString();
				}
			}
		}
	}

	updateSkills(): boolean {
		let changed = false;
		for (const k of this.skills.filter(e => !(e instanceof SkillContainerGURPS)) as Array<
			SkillGURPS | TechniqueGURPS
		>) {
			if (k.updateLevel()) changed = true;
		}
		return changed;
	}

	updateSpells(): boolean {
		let changed = false;
		for (const b of this.spells.filter(e => !(e instanceof SpellContainerGURPS)) as Array<
			SpellGURPS | RitualMagicSpellGURPS
		>) {
			if (b.updateLevel()) changed = true;
		}
		return changed;
	}

	// Directed Skill Getters
	baseSkill(def: SkillDefault, require_points: boolean): SkillGURPS | TechniqueGURPS | null {
		if (!def.skillBased) return null;
		return this.bestSkillNamed(def.name ?? "", def.specialization ?? "", require_points, null);
	}

	bestSkillNamed(
		name: string,
		specialization: string,
		require_points: boolean,
		excludes: Map<string, boolean> | null,
	): SkillGURPS | TechniqueGURPS | null {
		let best: SkillGURPS | TechniqueGURPS | null = null;
		let level = Math.max();
		this.skillNamed(name, specialization, require_points, excludes).forEach(sk => {
			const skill_level = sk.calculateLevel.level;
			if (best || level < skill_level) {
				best = sk;
				level = skill_level;
			}
		});
		return best;
	}

	skillNamed(
		name: string,
		specialization: string,
		require_points: boolean,
		excludes: Map<string, boolean> | null,
	): Collection<SkillGURPS | TechniqueGURPS> {
		const skills: Collection<SkillGURPS | TechniqueGURPS> = new Collection();
		this.skills.forEach(item => {
			if (
				(!excludes || !excludes.get(item.name!)) &&
				(item instanceof SkillGURPS || item instanceof TechniqueGURPS) &&
				item.name == name &&
				(!require_points || item instanceof TechniqueGURPS || item.adjustedPoints(null) > 0) &&
				(specialization == "" || specialization == item.specialization)
			)
				skills.set(item.data._id!, item);
		});
		return skills;
	}

	// Feature Processing
	bonusFor(featureID: string, tooltip: TooltipGURPS | null): number {
		let total = 0;
		this.featureMap?.get(featureID.toLowerCase())?.forEach(feature => {
			if (feature.type == featureID) {
				total += feature.adjustedAmount;
				feature.addToTooltip(tooltip);
			}
		});
		return total;
	}

	skillComparedBonusFor(
		featureID: string,
		name: string,
		specialization: string,
		tags: string[],
		tooltip: TooltipGURPS | null,
	): number {
		let total = 0;
		this.featureMap.get(featureID)?.forEach(f => {
			if (!(f instanceof SkillBonus)) return;
			if (
				stringCompare(name, f.name) &&
				stringCompare(specialization, f.specialization) &&
				stringCompare(tags, f.tags)
			) {
				total += f.adjustedAmount;
				f.addToTooltip(tooltip);
			}
		});
		return total;
	}

	skillPointComparedBonusFor(
		featureID: string,
		name: string,
		specialization: string,
		tags: string[],
		tooltip: TooltipGURPS | null,
	): number {
		let total = 0;
		this.featureMap?.get(featureID)?.forEach(f => {
			if (!(f instanceof SkillPointBonus)) return;
			if (
				stringCompare(name, f.name) &&
				stringCompare(specialization, f.specialization) &&
				stringCompare(tags, f.tags)
			) {
				total += f.adjustedAmount;
				f.addToTooltip(tooltip);
			}
		});
		return total;
	}

	spellBonusesFor(featureID: string, qualifier: string, tags: string[], tooltip: TooltipGURPS | null): number {
		let level = this.bonusFor(featureID, tooltip);
		level += this.bonusFor(featureID + "/" + qualifier.toLowerCase(), tooltip);
		level += this.spellComparedBonusFor(featureID + "*", qualifier, tags, tooltip);
		return level;
	}

	spellPointBonusesFor(featureID: string, qualifier: string, tags: string[], tooltip: TooltipGURPS | null): number {
		let level = this.bonusFor(featureID, tooltip);
		level += this.bonusFor(featureID + "/" + qualifier.toLowerCase(), tooltip);
		level += this.spellComparedBonusFor(featureID + "*", qualifier, tags, tooltip);
		return level;
	}

	spellComparedBonusFor(featureID: string, name: string, tags: string[], tooltip: TooltipGURPS | null): number {
		let total = 0;
		this.featureMap.get(featureID.toLowerCase())?.forEach(feature => {
			if (
				feature instanceof SpellBonus &&
				stringCompare(name, feature.name) &&
				stringCompare(tags, feature.tags)
			) {
				total += feature.adjustedAmount;
				feature.addToTooltip(tooltip);
			}
		});
		return total;
	}

	bestCollegeSpellBonus(colleges: string[], tags: string[], tooltip: TooltipGURPS | null): number {
		let best = Math.max();
		let bestTooltip = "";
		for (const c of colleges) {
			const buffer = new TooltipGURPS();
			if (!tooltip) tooltip = new TooltipGURPS();
			const points = this.spellPointBonusesFor("spell.college.points", c, tags, buffer);
			if (best < points) {
				best = points;
				if (buffer) bestTooltip = buffer.toString();
			}
		}
		if (tooltip) tooltip.push(bestTooltip);
		if (best == Math.max()) best = 0;
		return best;
	}

	bestCollegeSpellPointBonus(colleges: string[], tags: string[], tooltip: TooltipGURPS | null): number {
		let best = Math.max();
		let bestTooltip = "";
		for (const c of colleges) {
			const buffer = new TooltipGURPS();
			if (!tooltip) tooltip = new TooltipGURPS();
			const points = this.spellBonusesFor("spell.college", c, tags, buffer);
			if (best < points) {
				best = points;
				if (buffer) bestTooltip = buffer.toString();
			}
		}
		if (tooltip) tooltip.push(bestTooltip);
		if (best == Math.max()) best = 0;
		return best;
	}

	costReductionFor(featureID: string): number {
		let total = 0;
		this.featureMap.get(featureID.toLowerCase())?.forEach(feature => {
			if (feature instanceof CostReduction) {
				total += feature.percentage;
			}
		});
		if (total > 80) total = 80;
		return Math.max(total, 0);
	}

	// Resolve attributes
	resolveAttributeCurrent(attr_id: string): number {
		const att = this.attributes?.get(attr_id)?.current;
		if (att) return att;
		return Math.max();
	}

	resolveAttributeName(attr_id: string): string {
		const def = this.resolveAttributeDef(attr_id);
		if (def) return def.name;
		return "unknown";
	}

	resolveAttributeDef(attr_id: string): AttributeDef | null {
		const a = this.attributes.get(attr_id);
		if (a) return a.attribute_def;
		return null;
	}

	resolveVariable(variableName: string): string {
		if (this.variableResolverExclusions?.has(variableName)) {
			console.warn(`Attempt to resolve variable via itself: $${variableName}`);
			return "";
		}
		if (!this.variableResolverExclusions) this.variableResolverExclusions = new Map();
		this.variableResolverExclusions.set(variableName, true);
		if (gid.SizeModifier == variableName) return this.profile.SM.signedString();
		const parts = variableName.split("."); // TODO check
		const attr = this.attributes.get(parts[0]);
		if (!attr) {
			console.warn(`No such variable: $${variableName}`);
			return "";
		}
		const def = this.settings.attributes[attr.attr_id];
		if (!def) {
			console.warn(`No such variable definition: $${variableName}`);
			return "";
		}
		if (def.type == "pool" && parts.length > 1) {
			switch (parts[1]) {
				case "current":
					return attr.current.toString();
				case "maximum":
					return attr.max.toString();
				default:
					console.warn(`No such variable: $${variableName}`);
					return "";
			}
		}
		this.variableResolverExclusions = new Map();
		return attr?.current.toString();
	}

	// Import from GCS
	async importCharacter() {
		const import_path = this.importData.path;
		const import_name = import_path.match(/.*[/\\]Data[/\\](.*)/);
		if (!!import_name) {
			const file_path = import_name[1].replace(/\\/g, "/");
			const request = new XMLHttpRequest();
			request.open("GET", file_path);

			new Promise(resolve => {
				request.onload = () => {
					if (request.status === 200) {
						const text = request.response;
						ActorImporter.import(this, { text: text, name: import_name[1], path: import_path });
					} else this._openImportDialog();
					resolve(this);
				};
			});
			request.send(null);
		} else this._openImportDialog();
	}

	_openImportDialog() {
		setTimeout(async () => {
			new Dialog(
				{
					title: `Import character data for: ${this.name}`,
					content: await renderTemplate(`systems/${SYSTEM_NAME}/templates/actor/import.hbs`, {
						name: `"${this.name}"`,
					}),
					buttons: {
						import: {
							icon: `<i class="fas fa-file-import"></i>`,
							label: `Import`,
							callback: html => {
								const form = $(html).find("form")[0];
								const files = form.data.files;
								if (!files.length) {
									return ui.notifications?.error("You did not upload a data file!");
								} else {
									const file = files[0];
									readTextFromFile(file).then(text =>
										ActorImporter.import(this, {
											text: text,
											name: file.name,
											path: file.path,
										}),
									);
								}
							},
						},
						no: {
							icon: `<i class="fas fa-times"></i>`,
							label: `Cancel`,
						},
					},
					default: "import",
				},
				{
					width: 400,
				},
			).render(true);
		}, 200);
	}
}

export function processFeature(parent: any, m: Map<string, Feature[]>, f: Feature, levels: number): void {
	const key = f.type;
	const list = m.get(key) ?? [];
	// f.setParent(parent);
	// f.setLevel(levels);
	f.levels = levels; // ?
	list.push(f);
	m.set(key, list!);
}

interface CharacterGURPS extends BaseActorGURPS {
	readonly data: CharacterDataGURPS;
}

export { CharacterGURPS };
