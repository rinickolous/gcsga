import { BaseActorGURPS } from "@actor";
import { ActorConstructorContextGURPS } from "@actor/base";
import { CostReduction, Feature, SkillBonus, SkillPointBonus, SpellBonus } from "@feature";
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
import {
	ActorDataBaseProperties,
	ActorDataConstructorData,
} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/actorData";
import { PropertiesToSource } from "@league-of-foundry-developers/foundry-vtt-types/src/types/helperTypes";
import { Attribute, AttributeObj } from "@module/attribute";
import { AttributeDef } from "@module/attribute/attribute_def";
import { ThresholdOp } from "@module/attribute/pool_threshold";
import { attrPrefix, gid } from "@module/data";
import { SETTINGS_TEMP } from "@module/settings";
import { SkillDefault } from "@module/skill-default";
import { TooltipGURPS } from "@module/tooltip";
import { getCurrentTime, i18n, newUUID, stringCompare } from "@util";
import { CharacterDataGURPS, CharacterSource, Encumbrance } from "./data";

class CharacterGURPS extends BaseActorGURPS {
	variableResolverExclusions: Map<string, boolean> = new Map();
	featureMap: Map<string, Feature[]> = new Map();

	constructor(data: CharacterSource, context: ActorConstructorContextGURPS = {}) {
		super(data, context);
		if (!context.gcsga?.imported) {
			if (!this.data.data.id) this.data.data.id = newUUID();
			if (!this.data.data.created_date) {
				this.data.data.created_date = getCurrentTime();
				this.data.data.modified_date = this.data.data.created_date;
			}
			if (!this.data.data.total_points) this.data.data.total_points = SETTINGS_TEMP.general.initial_points;
			if (!this.data.data.settings) {
				this.data.data.settings = SETTINGS_TEMP.sheet;
				this.data.data.attributes = this.newAttributes();
			}
			if (SETTINGS_TEMP.general.auto_fill) {
				this.data.data.profile = SETTINGS_TEMP.general.auto_fill;
			}
			if (!this.data.data.calc)
				this.data.data.calc = {
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
				};
		}
	}

	override update(
		data?: DeepPartial<ActorDataConstructorData | (ActorDataConstructorData & Record<string, unknown>)>,
		context?: DocumentModificationContext & foundry.utils.MergeObjectOptions,
	): Promise<this | undefined> {
		// data = this.updateAttributes(data);
		console.log(data);
		return super.update(data, context);
	}
	protected override _onUpdate(
		changed: DeepPartial<PropertiesToSource<ActorDataBaseProperties>>,
		options: DocumentModificationOptions,
		userId: string,
	): void {
		console.log(changed, options, userId);
		super._onUpdate(changed, options, userId);
	}

	updateAttributes(
		data?: DeepPartial<ActorDataConstructorData | (ActorDataConstructorData & Record<string, unknown>)>,
	) {
		let atts: Map<string, Attribute> = this.attributes;
		for (let i in data) {
			if (i.includes("data.attributes")) {
				const [id, type] = i.split("attributes.")[1].split(".");
				const att = atts.get(id);
				if (att) {
					//@ts-ignore
					att[type] = data[i];
					atts.set(id, att);
					//@ts-ignore
					delete data[i];
				}
			}
		}
		// this.attributes = atts;
		return data;
	}

	// Getters
	get profile() {
		return this.data.data.profile;
	}

	get attributes() {
		const a: Map<string, Attribute> = new Map();
		let i = 0;
		for (const attr_id in this.data.data.attributes) {
			a.set(attr_id, new Attribute(this, attr_id, i));
			i++;
		}
		return a;
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
		for (const s of this.skills.filter((e) => e instanceof SkillGURPS || e instanceof TechniqueGURPS) as Array<
			SkillGURPS | TechniqueGURPS
		>) {
			total += s.points ?? 0;
		}
		return total;
	}

	get spellPoints(): number {
		let total = 0;
		for (const s of this.spells.filter(
			(e) => e instanceof SpellGURPS || e instanceof RitualMagicSpellGURPS,
		) as Array<SpellGURPS | RitualMagicSpellGURPS>) {
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
		let dodge = 3 + this.calc.dodge_bonus + this.resolveAttributeCurrent(gid.BasicSpeed);
		const divisor = 2 * Math.min(this.countThresholdOpMet("halve_dodge", this.attributes), 2);
		if (divisor > 0) {
			dodge = Math.ceil(dodge / divisor);
		}
		return Math.max(dodge + enc.penalty, 1);
	}

	countThresholdOpMet(op: ThresholdOp, attributes: Map<string, Attribute>) {
		let total = 0;
		attributes.forEach((a) => {
			const threshold = a.currentThreshold;
			if (threshold && threshold.ops.includes(op)) total++;
		});
		return total;
	}

	get settings() {
		return this.data.data.settings;
	}

	get adjustedSizeModifier(): number {
		return (this.profile.SM ?? 0) + this.size_modifier_bonus;
	}

	get created_date(): string {
		return this.data.data.created_date;
	}

	get modified_date(): string {
		return this.data.data.created_date;
	}

	get basicLift(): number {
		return (this.resolveAttributeCurrent(gid.Strength) + this.lifting_st_bonus) ** 2 / 5;
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
		this.carried_equipment.forEach((e) => {
			if (e.parent == this) total += e.extendedWeight(for_skills, this.settings.default_weight_units);
		});
		return total;
	}

	wealthCarried(): number {
		let value = 0;
		this.carried_equipment.forEach((e) => {
			if (e.parent == this) value += e.extendedValue();
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
		//@ts-ignore
		return new Collection(
			this.deepItems
				.filter((item) => item instanceof TraitGURPS || item instanceof TraitContainerGURPS)
				.map((item) => {
					return [item.data._id!, item];
				}),
		);
	}

	get skills(): Collection<SkillGURPS | TechniqueGURPS | SkillContainerGURPS> {
		//@ts-ignore
		return new Collection(
			this.deepItems
				.filter(
					(item) =>
						item instanceof SkillGURPS ||
						item instanceof TechniqueGURPS ||
						item instanceof SkillContainerGURPS,
				)
				.map((item) => {
					return [item.data._id!, item];
				}),
		);
	}

	get spells(): Collection<SpellGURPS | RitualMagicSpellGURPS | SpellContainerGURPS> {
		//@ts-ignore
		return new Collection(
			this.deepItems
				.filter(
					(item) =>
						item instanceof SpellGURPS ||
						item instanceof RitualMagicSpellGURPS ||
						item instanceof SpellContainerGURPS,
				)
				.map((item) => {
					return [item.data._id!, item];
				}),
		);
	}

	get equipment(): Collection<EquipmentGURPS | EquipmentContainerGURPS> {
		//@ts-ignore
		return new Collection(
			this.deepItems
				.filter((item) => item instanceof EquipmentGURPS || item instanceof EquipmentContainerGURPS)
				.map((item) => {
					return [item.data._id!, item];
				}),
		);
	}

	get carried_equipment(): Collection<EquipmentGURPS | EquipmentContainerGURPS> {
		return new Collection(
			this.equipment
				.filter((item) => !item.other)
				.map((item) => {
					return [item.data._id!, item];
				}),
		);
	}

	get other_equipment(): Collection<EquipmentGURPS | EquipmentContainerGURPS> {
		return new Collection(
			this.equipment
				.filter((item) => item.other)
				.map((item) => {
					return [item.data._id!, item];
				}),
		);
	}

	get notes(): Collection<NoteGURPS | NoteContainerGURPS> {
		//@ts-ignore
		return new Collection(
			this.deepItems
				.filter((item) => item instanceof NoteGURPS || item instanceof NoteContainerGURPS)
				.map((item) => {
					return [item.data._id!, item];
				}),
		);
	}

	//TODO changed
	get reactions(): Collection<any> {
		return new Collection();
	}

	get conditional_modifiers(): Collection<any> {
		return new Collection();
	}

	newAttributes(): Record<string, AttributeObj> {
		const a: Map<string, Attribute> = new Map();
		let i = 0;
		for (const attr_id in this.settings.attributes) {
			a.set(attr_id, new Attribute(this, attr_id, i));
			i++;
		}
		console.log(Object.fromEntries(a));
		return Object.fromEntries(a);
	}

	// Prepare data
	prepareData(): void {
		console.log(this);
	}

	prepareEmbeddedDocuments(): void {
		this.updateSkills();
		this.updateSpells();
		for (let i = 0; i < 5; i++) {
			this.processFeatures();
			this.processPrereqs();
			const skills_changed = this.updateSkills();
			const spells_changed = this.updateSpells();
			if (!skills_changed && !spells_changed) break;
		}
	}

	updateProfile(): void {
		if (this.profile) this.profile.SM = this.bonusFor(`${attrPrefix}${gid.SizeModifier}`, null);
	}

	processFeatures() {
		const featureMap: Map<string, Feature[]> = new Map();
		for (const t of this.traits) {
			if (t instanceof TraitGURPS) {
				for (const f of t.features) {
					processFeature(t, featureMap, f, Math.max(t.levels, 0));
				}
			}
			for (const f of CR_Features.get(t.crAdj)) {
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
			console.log(this.attributes);
			this.attributes.forEach((attr) => {
				const def = attr.attribute_def;
				if (def) {
					const attrID = attrPrefix + attr.attr_id;
					attr.bonus = this.bonusFor(attrID, null);
					if (def.type != "decimal") attr.bonus = Math.floor(attr.bonus);
					attr.cost_reduction = this.costReductionFor(attrID);
				} else {
					attr.bonus = 0;
					attr.cost_reduction = 0;
				}
			});
		}
		this.updateProfile();
		if (this.calc) this.calc.dodge_bonus = this.bonusFor(`${attrPrefix}${gid.Dodge}`, null);
		if (this.calc) this.calc.parry_bonus = this.bonusFor(`${attrPrefix}${gid.Parry}`, null);
		if (this.calc) this.calc.block_bonus = this.bonusFor(`${attrPrefix}${gid.Block}`, null);
	}

	processPrereqs(): void {
		const prefix = "\n● ";
		const not_met = i18n("gcsga.prerqs.not_met");
		for (const t of this.traits.filter((e) => e instanceof TraitGURPS)) {
			t.unsatisfied_reason = "";
			if (t instanceof TraitGURPS && !t.prereqsEmpty) {
				const tooltip = new TooltipGURPS();
				if (!t.prereqs.satisfied(this, t, tooltip, prefix)) {
					t.unsatisfied_reason = not_met + tooltip.toString();
				}
			}
		}
		for (let k of this.skills.filter((e) => !(e instanceof SkillContainerGURPS))) {
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
		for (let b of this.spells.filter((e) => !(e instanceof SpellContainerGURPS))) {
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
		for (const k of this.skills.filter((e) => !(e instanceof SkillContainerGURPS)) as Array<
			SkillGURPS | TechniqueGURPS
		>) {
			if (k.updateLevel()) changed = true;
		}
		return changed;
	}

	updateSpells(): boolean {
		let changed = false;
		for (const b of this.spells.filter((e) => !(e instanceof SpellContainerGURPS)) as Array<
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
		this.skillNamed(name, specialization, require_points, excludes).forEach((sk) => {
			const skill_level = sk.calculateLevel().level;
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
		//@ts-ignore
		const a: Collection<SkillGURPS | TechniqueGURPS> = new Collection(
			this.skills
				.filter(
					(s) =>
						(!excludes || !excludes.get(s.name!)) &&
						!(s instanceof SkillContainerGURPS) &&
						s.name == name &&
						(!require_points || s instanceof TechniqueGURPS || s.adjustedPoints(null) > 0) &&
						(specialization == "" || specialization == s.specialization),
				)
				.map((e) => {
					return [e.id!, e];
				}),
		);
		return a;
	}

	// Feature Processing
	bonusFor(featureID: string, tooltip: TooltipGURPS | null): number {
		let total = 0;
		this.featureMap.get(featureID.toLowerCase())?.forEach((feature) => {
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
		this.featureMap.get(featureID)?.forEach((f) => {
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
		this.featureMap.get(featureID)?.forEach((f) => {
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
		this.featureMap.get(featureID.toLowerCase())?.forEach((feature) => {
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
		this.featureMap.get(featureID.toLowerCase())?.forEach((feature) => {
			if (feature instanceof CostReduction) {
				total += feature.percentage;
			}
		});
		if (total > 80) total = 80;
		return Math.max(total, 0);
	}

	// Calculate Levels
	// calculateSkillLevel(skill: SkillGURPS | TechniqueGURPS | SpellGURPS, points?: number): SkillGURPS["level"] {
	// 	const tooltip = new TooltipGURPS();
	// 	const def = skill.defaultedFrom;
	// 	if (!points) points = skill.points ?? 0;
	// 	let relative_level = SkillGURPS.baseRelativeLevel(skill.difficulty);
	// 	let level = this.resolveAttributeCurrent(skill.attribute);
	// 	if (level != Math.max()) {
	// 		if (skill.difficulty == "w") {
	// 			points /= 3;
	// 		} else if (def && def.points > 0) {
	// 			points += def.points;
	// 		}
	// 		points = Math.floor(points);
	// 		if (points == 1) {
	// 			// relative_level is preset to this point value
	// 		} else if (points > 1 && points < 4) {
	// 			relative_level += 1;
	// 		} else if (points > 4) {
	// 			relative_level += 1 + Math.floor(points / 4);
	// 		} else if (skill.difficulty != "w" && !!def && def.points < 0) {
	// 			relative_level = def.adjustedLevel - level;
	// 		} else {
	// 			level = Math.max();
	// 			relative_level = 0;
	// 		}
	// 	}
	// 	if (level != Math.max()) {
	// 		level += relative_level;
	// 		if (skill.difficulty != "w" && !!def && level < def.adjustedLevel) {
	// 			level = def.adjustedLevel;
	// 		}
	// 		let bonus = this.skillComparedBonusFor(
	// 			"skill_bonus",
	// 			skill.name ?? "",
	// 			skill.specialization,
	// 			skill.tags,
	// 			tooltip,
	// 		);
	// 		level += bonus;
	// 		relative_level += bonus;
	// 		bonus = this.encumbrancePenalty * skill.encumbrancePenaltyMultiplier;
	// 		level += bonus;
	// 		relative_level += bonus;
	// 		if (bonus != 0) {
	// 			tooltip.push("TO DO");
	// 		}
	// 	}
	// 	return {
	// 		level: level,
	// 		relative_level: relative_level,
	// 		tooltip: tooltip.toString(),
	// 	};
	// }
	//
	// Resolve attributes
	resolveAttributeCurrent(attr_id: string): number {
		const att = this.attributes.get(attr_id)?.current;
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
		if (this.variableResolverExclusions.get(variableName)) {
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
}

export function processFeature(parent: any, m: Map<string, Feature[]>, f: Feature, levels: number): void {
	const key = f.type;
	const list = m.get(key);
	// f.setParent(parent);
	// f.setLevel(levels);
	f.levels = levels; // ?
	list!.push(f);
	m.set(key, list!);
}

interface CharacterGURPS extends BaseActorGURPS {
	readonly data: CharacterDataGURPS;
}

export { CharacterGURPS };
