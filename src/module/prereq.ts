import { CharacterGURPS } from "@actor";
import { extractTechLevel, i18n, numberCompare, stringCompare } from "@util";
import { NumberCompare, SpellPrereqSubType, StringCompare } from "@module/data";
import { TooltipGURPS } from "./tooltip";
import {
	EquipmentContainerGURPS,
	EquipmentGURPS,
	RitualMagicSpellGURPS,
	SkillContainerGURPS,
	SkillGURPS,
	SpellContainerGURPS,
	SpellGURPS,
	TechniqueGURPS,
} from "@item";

export type PrereqType =
	| "prereq_list"
	| "trait_prereq"
	| "attribute_prereq"
	| "contained_quantity_prereq"
	| "contained_weight_prereq"
	| "skill_prereq"
	| "spell_prereq";

export interface PrereqConstructionContext {
	ready?: boolean;
}

export type Prereq =
	| PrereqList
	| TraitPrereq
	| AttributePrereq
	| ContainedWeightPrereq
	| ContainedQuantityPrereq
	| SkillPrereq
	| SpellPrereq;

export class BasePrereq {
	type: PrereqType = "trait_prereq";
	has = true;

	constructor(data?: Prereq, context: PrereqConstructionContext = {}) {
		if (context.ready) {
			Object.assign(this, data);
		} else {
			mergeObject(context, {
				ready: true,
			});
			const PrereqConstructor = classes[data?.type as PrereqType];
			if (PrereqConstructor) return new PrereqConstructor(data as any, context);
			throw new Error("No PrereqConstructor provided");
		}
	}

	static get default() {
		return new TraitPrereq(
			{
				type: "trait_prereq",
				name: { compare: "is", qualifier: "" },
				notes: { compare: "none", qualifier: "" },
				levels: { compare: "at_least", qualifier: 0 },
				has: true,
				satisfied: () => false,
			},
			{ ready: true },
		);
	}

	satisfied(_: CharacterGURPS, __: any, ___: TooltipGURPS, ____: string): boolean {
		console.error("Cannot satisfy BasePrereq");
		return false;
	}
}

export class PrereqList extends BasePrereq {
	prereqs: Prereq[] = [];
	all = true;
	when_tl?: NumberCompare = { compare: "none", qualifier: 0 };

	constructor(data: PrereqList, context: PrereqConstructionContext = {}) {
		super(data, context);
		if (!!(data as PrereqList).prereqs)
			(data as PrereqList).prereqs.forEach((e: Prereq) => {
				this.prereqs.push(new classes[e?.type as PrereqType](e as any, context));
			});
	}

	override satisfied(character: CharacterGURPS, exclude: any, buffer: TooltipGURPS, prefix: string): boolean {
		if (this.when_tl?.compare != "none") {
			let tl = extractTechLevel(character.profile.tech_level);
			if (tl < 0) tl = 0;
			if (!numberCompare(tl, this.when_tl)) return true;
		}
		let count = 0;
		let local = new TooltipGURPS();
		for (const p of this.prereqs) {
			if (p.satisfied(character, exclude, local, prefix)) count++;
		}
		let satisfied = count == this.prereqs.length || (!this.all && count > 0);
		if (!satisfied) {
			if (this.all) buffer.push(i18n("gcsga.prereqs.requires_all"));
			else buffer.push(i18n("gcsga.prereqs.requires_all"));
			buffer.push(local);
		}
		return satisfied;
	}
}

export class TraitPrereq extends BasePrereq {
	name: StringCompare = { compare: "is", qualifier: "" };
	notes: StringCompare = { compare: "none", qualifier: "" };
	levels: NumberCompare = { compare: "at_least", qualifier: 0 };

	constructor(data: TraitPrereq, context: PrereqConstructionContext = {}) {
		super(data, context);
	}

	override satisfied(character: CharacterGURPS, exclude: any, tooltip: TooltipGURPS, prefix: string): boolean {
		let satisfied = false;
		character.traits.forEach((t) => {
			if (exclude == t || !stringCompare(t.name, this.name)) return false;
			let notes = t.notes;
			let mod_notes = t.modifier_notes;
			if (mod_notes) notes += "\n" + mod_notes;
			if (!stringCompare(notes, this.notes)) return false;
			satisfied = numberCompare(Math.max(0, t.levels), this.levels);
			return satisfied;
		});
		if (this.has) satisfied = !satisfied;
		if (!satisfied) {
			tooltip.push(prefix);
			tooltip.push(i18n(`gcsga.prereqs.has.${this.has}`));
			tooltip.push(i18n(`gcsga.prereqs.trait.name`));
			tooltip.push(i18n(`gcsga.prereqs.criteria.${this.name?.compare}`));
			if (this.name?.compare != "none") tooltip.push(this.name!.qualifier);
			if (this.notes?.compare != "none") {
				tooltip.push(i18n(`gcsga.prereqs.trait.notes`));
				tooltip.push(i18n(`gcsga.prereqs.criteria.${this.notes?.compare}`));
				tooltip.push(this.notes!.qualifier);
				tooltip.push(",");
			}
			tooltip.push(i18n(`gcsga.prereqs.trait.level`));
			tooltip.push(i18n(`gcsga.prereqs.criteria.${this.levels?.compare}`));
			tooltip.push(this.levels!.qualifier.toString());
		}
		return satisfied;
	}
}
export class AttributePrereq extends BasePrereq {
	which = "st";
	combined_with = "";
	qualifier: NumberCompare = { compare: "at_least", qualifier: 10 };

	constructor(data: AttributePrereq, context: PrereqConstructionContext = {}) {
		super(data, context);
	}

	satisfied(character: CharacterGURPS, _: any, tooltip: TooltipGURPS, prefix: string): boolean {
		let value = character.resolveAttributeCurrent(this.which);
		if (this.combined_with != "") value += character.resolveAttributeCurrent(this.combined_with);
		let satisfied = numberCompare(value, this.qualifier);
		if (!this.has) satisfied = !satisfied;
		if (!satisfied) {
			tooltip.push(prefix);
			tooltip.push(i18n(`gcsga.prerqs.has.${this.has}`));
			tooltip.push(" ");
			tooltip.push(character.resolveAttributeName(this.which));
			if (this.combined_with != "") {
				tooltip.push(i18n(`gcsga.prereqs.attribute.plus`));
				tooltip.push(character.resolveAttributeName(this.combined_with));
			}
			tooltip.push(i18n(`gcsga.prereqs.attribute.which`));
			tooltip.push(i18n(`gcsga.prereqs.criteria.${this.qualifier?.compare}`));
			tooltip.push(this.qualifier!.qualifier.toString());
		}
		return satisfied;
	}
}
export class ContainedWeightPrereq extends BasePrereq {
	qualifier: NumberCompare = { compare: "at_most", qualifier: 5 };

	constructor(data: ContainedWeightPrereq, context: PrereqConstructionContext = {}) {
		super(data, context);
	}

	satisfied(character: CharacterGURPS, exclude: any, tooltip: TooltipGURPS, prefix: string): boolean {
		let satisfied = false;
		const eqp = exclude as EquipmentGURPS | EquipmentContainerGURPS;
		if (eqp) {
			satisfied = !(eqp instanceof EquipmentContainerGURPS);
			if (!satisfied) {
				const units = character.settings.default_weight_units;
				const weight = eqp.extended_weight(false, units) - eqp.adjusted_weight(false, units);
				satisfied = numberCompare(weight, this.qualifier);
			}
		}
		if (!this.has) satisfied = !satisfied;
		if (!satisfied) {
			tooltip.push(prefix);
			tooltip.push(i18n(`gcsga.prerqs.has.${this.has}`));
			tooltip.push(i18n(`gcsga.prereqs.weight`));
			tooltip.push(i18n(`gcsga.prereqs.criteria.${this.qualifier?.compare}`));
			tooltip.push(this.qualifier!.qualifier.toString());
		}
		return satisfied;
	}
}
export class ContainedQuantityPrereq extends BasePrereq {
	quantity: NumberCompare = { compare: "at_most", qualifier: 1 };

	constructor(data: ContainedQuantityPrereq, context: PrereqConstructionContext = {}) {
		super(data, context);
	}

	satisfied(_: CharacterGURPS, exclude: any, tooltip: TooltipGURPS, prefix: string): boolean {
		let satisfied = false;
		let eqp = exclude instanceof EquipmentGURPS || exclude instanceof EquipmentContainerGURPS ? exclude : null;
		if (eqp) {
			satisfied = !(eqp instanceof EquipmentContainerGURPS);
			if (!satisfied) {
				let quantity = 0;
				(eqp as EquipmentContainerGURPS).children.forEach((ch) => {
					quantity += ch.quantity;
				});
				satisfied = numberCompare(quantity, this.quantity);
			}
		}
		if (!this.has) satisfied = !satisfied;

		if (!satisfied) {
			tooltip.push(prefix);
			tooltip.push(i18n(`gcsga.prereqs.has.${this.has}`));
			tooltip.push(i18n(`gcsga.prereqs.quantity`));
			tooltip.push(i18n(`gcsga.prereqs.criteria.${this.quantity?.compare}`));
			tooltip.push(this.quantity.qualifier.toString());
		}
		return satisfied;
	}
}
export class SkillPrereq extends BasePrereq {
	name: StringCompare = { compare: "is", qualifier: "" };
	specialization: StringCompare = { compare: "none", qualifier: "" };
	level: NumberCompare = { compare: "at_least", qualifier: 0 };

	constructor(data: SkillPrereq, context: PrereqConstructionContext = {}) {
		super(data, context);
	}

	satisfied(character: CharacterGURPS, exclude: any, tooltip: TooltipGURPS, prefix: string): boolean {
		let satisfied = false;
		let tech_level = "";
		if (exclude instanceof SkillGURPS) tech_level = exclude.tech_level;
		character.skills.forEach((sk) => {
			if (sk instanceof SkillContainerGURPS) return;
			sk = sk as SkillGURPS | TechniqueGURPS;
			if (
				exclude == sk ||
				!stringCompare(sk.name, this.name) ||
				!stringCompare(sk.specialization, this.specialization)
			)
				return false;
			satisfied = numberCompare(sk.level.level, this.level);
			if (satisfied && tech_level) satisfied = !sk.tech_level || tech_level == sk.tech_level;
		});
		if (!this.has) satisfied = !satisfied;
		if (!satisfied) {
			tooltip.push(prefix);
			tooltip.push(i18n(`gcsga.prereqs.has.${this.has}`));
			tooltip.push(i18n(`gcsga.prereqs.skill.name`));
			tooltip.push(i18n(`gcsga.prereqs.criteria.${this.name?.compare}`));
			tooltip.push(this.name?.qualifier);
			if (this.specialization.compare != "none") {
				tooltip.push(i18n(`gcsga.prereqs.skill.specialization`));
				tooltip.push(i18n(`gcsga.prereqs.criteria.${this.specialization.compare}`));
				tooltip.push(this.specialization.qualifier);
				tooltip.push(",");
			}
			if (!tech_level) {
				tooltip.push(i18n(`gcsga.prereqs.skill.level`));
				tooltip.push(i18n(`gcsga.prereqs.criteria.${this.level.compare}`));
				tooltip.push(this.level.qualifier.toString());
			} else {
				if (this.specialization.compare != "none") {
					tooltip.push(",");
				}
				tooltip.push(i18n(`gcsga.prereqs.skill.level`));
				tooltip.push(i18n(`gcsga.prereqs.criteria.${this.level.compare}`));
				tooltip.push(this.level.qualifier.toString());
				tooltip.push(i18n(`gcsga.prereqs.skill.tech_level`));
			}
		}
		return satisfied;
	}
}
export class SpellPrereq extends BasePrereq {
	quantity: NumberCompare = { compare: "at_least", qualifier: 1 };
	sub_type: SpellPrereqSubType = "name";
	qualifier: StringCompare = { compare: "is", qualifier: "" };

	constructor(data: SpellPrereq, context: PrereqConstructionContext = {}) {
		super(data, context);
	}

	satisfied(character: CharacterGURPS, exclude: any, tooltip: TooltipGURPS, prefix: string): boolean {
		let tech_level = "";
		if (exclude instanceof SpellGURPS || exclude instanceof RitualMagicSpellGURPS) tech_level = exclude.tech_level;
		let count = 0;
		let colleges: Map<string, boolean> = new Map();
		character.spells.forEach((sp) => {
			if (sp instanceof SpellContainerGURPS) return;
			sp = sp as SpellGURPS | RitualMagicSpellGURPS;
			if (exclude == sp || sp.points == 0) return;
			switch (this.sub_type) {
				case "name":
					if (stringCompare(sp.name, this.qualifier)) count++;
					return;
				case "tag":
					if (stringCompare(sp.tags, this.qualifier)) count++;
					break;
				case "college":
					if (stringCompare(sp.college, this.qualifier)) count++;
					break;
				case "college_count":
					for (const c of sp.college) colleges.set(c, true);
					break;
				case "any":
					count++;
					break;
			}
		});
		if (this.sub_type == "college_count") count = colleges.entries.length;
		let satisfied = numberCompare(count, this.quantity);
		if (!this.has) satisfied = !satisfied;
		if (!satisfied) {
			tooltip.push(prefix);
			tooltip.push(`gcsga.prereqs.has.${this.has}`);
			if (this.sub_type == "college_count") {
				tooltip.push(`gcsga.prereqs.spell.college_count`);
				tooltip.push(`gcsga.prereqs.criteria.${this.quantity.compare}`);
				tooltip.push(this.quantity.compare.toString());
			} else {
				tooltip.push(" ");
				tooltip.push(`gcsga.prereqs.criteria.${this.quantity.compare}`);
				if (this.quantity.qualifier == 1) tooltip.push(`gcsga.prereqs.spell.one`);
				else tooltip.push(`gcsga.prereqs.spell.many`);
				tooltip.push(" ");
				if (this.sub_type == "any") tooltip.push(`gcsga.prereqs.spell.any`);
				else {
					if (this.sub_type == "name") tooltip.push(`gcsga.prereqs.spell.name`);
					else if (this.sub_type == "tag") tooltip.push(`gcsga.prereqs.spell.tag`);
					else if (this.sub_type == "college") tooltip.push(`gcsga.prereqs.spell.college`);
					tooltip.push(`gcsga.prereqs.criteria.${this.qualifier.compare}`);
					tooltip.push(this.qualifier.qualifier);
				}
			}
		}
		return satisfied;
	}
}

export interface BasePrereq {
	type: PrereqType;
	has: boolean;
}

export interface PrereqList extends Omit<BasePrereq, "has"> {
	prereqs: Prereq[];
	all: boolean;
}

export interface TraitPrereq extends BasePrereq {
	name: StringCompare;
	levels: NumberCompare;
	notes: StringCompare;
}
export interface AttributePrereq extends BasePrereq {
	which: string;
	combined_with: string;
	qualifier: NumberCompare;
}
export interface ContainedWeightPrereq extends BasePrereq {
	qualifier: NumberCompare;
}
export interface ContainedQuantityPrereq extends BasePrereq {
	quantity: NumberCompare;
}
export interface SkillPrereq extends BasePrereq {
	name: StringCompare;
	specialization: StringCompare;
	level: NumberCompare;
}
export interface SpellPrereq extends BasePrereq {
	quantity: NumberCompare;
	sub_type: SpellPrereqSubType;
	qualifier: StringCompare;
}

const classes = {
	prereq_list: PrereqList,
	trait_prereq: TraitPrereq,
	attribute_prereq: AttributePrereq,
	contained_quantity_prereq: ContainedQuantityPrereq,
	contained_weight_prereq: ContainedWeightPrereq,
	skill_prereq: SkillPrereq,
	spell_prereq: SpellPrereq,
};
