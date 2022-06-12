import { NumberCompare, SpellPrereqSubType, StringCompare } from "./data";

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
	type: PrereqType;
	has?: boolean;

	constructor(data: Prereq, context: PrereqConstructionContext = {}) {
		this.type = data.type;
		if (!context.ready) {
			mergeObject(context, {
				ready: true,
			});
			const PrereqConstructor = classes[data.type as PrereqType];
			return PrereqConstructor ? new PrereqConstructor(data as any, context) : new BasePrereq(data, context);
		}
	}

	static get default() {
		return new BasePrereq({ type: "prereq_list", has: true });
	}
}

export class PrereqList extends BasePrereq {
	prereqs: Prereq[];
	all: boolean;

	constructor(data: Prereq, context: PrereqConstructionContext = {}) {
		super(data, context);
		this.all = (data as PrereqList).all ?? true;
		this.prereqs = [];
		if (!!(data as PrereqList).prereqs)
			(data as PrereqList).prereqs.forEach((e: Prereq) => {
				this.prereqs.push(new BasePrereq(e));
			});
	}
}

export class TraitPrereq extends BasePrereq {
	constructor(data: TraitPrereq, context: PrereqConstructionContext = {}) {
		super(data, context);
		this.has = data.has ?? true;
		this.name = data.name ?? { compare: "is", qualifier: "" };
		this.levels = data.levels ?? { compare: "none", qualifier: 0 };
		this.notes = data.notes ?? { compare: "none", qualifier: "" };
	}
}
export class AttributePrereq extends BasePrereq {
	constructor(data: AttributePrereq, context: PrereqConstructionContext = {}) {
		super(data, context);
		this.has = data.has ?? true;
		this.which = data.which ?? "";
		this.combined_with = data.combined_with ?? "";
		this.qualifier = data.qualifier ?? { compare: "at_least", qualifier: 10 };
	}
}
export class ContainedWeightPrereq extends BasePrereq {}
export class ContainedQuantityPrereq extends BasePrereq {}
export class SkillPrereq extends BasePrereq {}
export class SpellPrereq extends BasePrereq {}

export interface BasePrereq {
	type: PrereqType;
	has?: boolean;
}

export interface PrereqList extends BasePrereq {
	prereqs: Prereq[];
	all: boolean;
}

export interface TraitPrereq extends BasePrereq {
	name?: StringCompare;
	levels?: NumberCompare;
	notes?: StringCompare;
}
export interface AttributePrereq extends BasePrereq {
	which?: string;
	combined_with?: string;
	qualifier?: NumberCompare;
}
export interface ContainedWeightPrereq extends BasePrereq {
	quantity?: NumberCompare;
}
export interface ContainedQuantityPrereq extends BasePrereq {
	quantity?: NumberCompare;
}
export interface SkillPrereq extends BasePrereq {
	name?: StringCompare;
	specialization?: StringCompare;
	level?: NumberCompare;
}
export interface SpellPrereq extends BasePrereq {
	quantity?: NumberCompare;
	sub_type?: SpellPrereqSubType;
	qualifier?: StringCompare;
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
