import { BaseActorGURPS } from "@actor";
import { ActorConstructorContextGURPS } from "@actor/base";
import { Feature, SkillBonus, SkillPointBonus } from "@feature";
import { CostReduction } from "@feature/cost_reduction";
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
import { Attribute } from "@module/attribute";
import { AttributeDef } from "@module/attribute/attribute_def";
import { attrPrefix, gid } from "@module/data";
import { SETTINGS_TEMP } from "@module/settings";
import { SkillDefault } from "@module/skill-default";
import { TooltipGURPS } from "@module/tooltip";
import { getCurrentTime, i18n, newUUID, stringCompare } from "@util";
import { CharacterDataGURPS, CharacterSource } from "./data";

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
		}
	}

	// Getters
	get profile() {
		return this.data.data.profile;
	}

	get attributes() {
		return this.data.data.attributes;
	}

	get settings() {
		return this.data.data.settings;
	}

	get adjustedSizeModifier(): number {
		return this.profile.SM + this.size_modifier_bonus;
	}

	get calc() {
		return this.data.data.calc;
	}

	get created_date(): string {
		return this.data.data.created_date;
	}

	get modified_date(): string {
		return this.data.data.created_date;
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
		return this.data.data.calc.lifting_st_bonus;
	}
	set lifting_st_bonus(v: number) {
		this.data.data.calc.lifting_st_bonus = v;
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
					return [item.data._id, item];
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
					return [item.data._id, item];
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
					return [item.data._id, item];
				}),
		);
	}

	get equipment(): Collection<EquipmentGURPS | EquipmentContainerGURPS> {
		//@ts-ignore
		return new Collection(
			this.deepItems
				.filter((item) => item instanceof EquipmentGURPS || item instanceof EquipmentContainerGURPS)
				.map((item) => {
					return [item.data._id, item];
				}),
		);
	}

	get carried_equipment(): Collection<EquipmentGURPS | EquipmentContainerGURPS> {
		return new Collection(
			this.equipment
				.filter((item) => !item.other)
				.map((item) => {
					return [item.data._id, item];
				}),
		);
	}

	get other_equipment(): Collection<EquipmentGURPS | EquipmentContainerGURPS> {
		return new Collection(
			this.equipment
				.filter((item) => item.other)
				.map((item) => {
					return [item.data._id, item];
				}),
		);
	}

	get notes(): Collection<NoteGURPS | NoteContainerGURPS> {
		//@ts-ignore
		return new Collection(
			this.deepItems
				.filter((item) => item instanceof NoteGURPS || item instanceof NoteContainerGURPS)
				.map((item) => {
					return [item.data._id, item];
				}),
		);
	}

	newAttributes(): Map<string, Attribute> {
		const a: Map<string, Attribute> = new Map();
		let i = 0;
		for (const attr_id in this.settings.attributes) {
			a.set(attr_id, new Attribute(this, attr_id, i));
			i++;
		}
		return a;
	}

	// Prepare Data
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
		this.profile.SM = this.bonusFor(`${attrPrefix}${gid.SizeModifier}`, null);
	}

	processFeatures() {
		const featureMap: Map<string, Feature[]> = new Map();
		for (const t of this.traits) {
			if (t instanceof TraitGURPS) {
				for (const f of t.features) {
					processFeature(t, featureMap, f, Math.max(t.levels, 0));
				}
			}
			for (const f of CR_Features.get(t.cr_adj)) {
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
		this.lifting_st_bonus = this.bonusFor(`${attrPrefix}${gid.Strength}.lifting_only`, null);
		this.striking_st_bonus = this.bonusFor(`${attrPrefix}${gid.Strength}.striking_only`, null);
		this.throwing_st_bonus = this.bonusFor(`${attrPrefix}${gid.Strength}.throwing_only`, null);
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
		this.updateProfile();
		this.calc.dodge_bonus = this.bonusFor(`${attrPrefix}${gid.Dodge}`, null);
		this.calc.parry_bonus = this.bonusFor(`${attrPrefix}${gid.Parry}`, null);
		this.calc.block_bonus = this.bonusFor(`${attrPrefix}${gid.Block}`, null);
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
		if (!def.skill_based) return null;
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
	calculateSkillLevel(skill: SkillGURPS | TechniqueGURPS | SpellGURPS, points?: number): SkillGURPS["level"] {
		const tooltip = new TooltipGURPS();
		const def = skill.defaultedFrom;
		if (!points) points = skill.points ?? 0;
		let relative_level = SkillGURPS.baseRelativeLevel(skill.difficulty);
		let level = this.resolveAttributeCurrent(skill.attribute);
		if (level != Math.max()) {
			if (skill.difficulty == "w") {
				points /= 3;
			} else if (def && def.points > 0) {
				points += def.points;
			}
			points = Math.floor(points);
			if (points == 1) {
				// relative_level is preset to this point value
			} else if (points > 1 && points < 4) {
				relative_level += 1;
			} else if (points > 4) {
				relative_level += 1 + Math.floor(points / 4);
			} else if (skill.difficulty != "w" && !!def && def.points < 0) {
				relative_level = def.adjustedLevel - level;
			} else {
				level = Math.max();
				relative_level = 0;
			}
		}
		if (level != Math.max()) {
			level += relative_level;
			if (skill.difficulty != "w" && !!def && level < def.adjustedLevel) {
				level = def.adjustedLevel;
			}
			let bonus = this.skillComparedBonusFor(
				"skill_bonus",
				skill.name ?? "",
				skill.specialization,
				skill.tags,
				tooltip,
			);
			level += bonus;
			relative_level += bonus;
			bonus = this.encumbrancePenalty * skill.encumbrancePenaltyMultiplier;
			level += bonus;
			relative_level += bonus;
			if (bonus != 0) {
				tooltip.push("TO DO");
			}
		}
		return {
			level: level,
			relative_level: relative_level,
			tooltip: tooltip.toString(),
		};
	}

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
		if (gid.SizeModifier == variableName) return this.getData().profile.SM.signedString();
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
		return attr.calc.value!.toString();
	}
}

export function processFeature(parent: any, m: Map<string, Feature[]>, f: Feature, levels: number): void {
	const key = f.type;
	const list = m.get(key);
	f.setParent(parent);
	f.setLevel(levels);
	list!.push(f);
	m.set(key, list!);
}

interface CharacterGURPS extends BaseActorGURPS {
	readonly data: CharacterDataGURPS;
}

export { CharacterGURPS };
