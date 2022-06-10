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
			return PrereqConstructor ? new PrereqConstructor(data, context) : new BasePrereq(data, context);
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
		this.has = true;
		this.all = (data as PrereqList).all ?? true;
		this.prereqs = [];
		if (!!(data as PrereqList).prereqs)
			(data as PrereqList).prereqs.forEach((e: Prereq) => {
				this.prereqs.push(new BasePrereq(e));
			});
	}
}

export class TraitPrereq extends BasePrereq {}
export class AttributePrereq extends BasePrereq {}
export class ContainedWeightPrereq extends BasePrereq {}
export class ContainedQuantityPrereq extends BasePrereq {}
export class SkillPrereq extends BasePrereq {}
export class SpellPrereq extends BasePrereq {}

export interface BasePrereq {
	type: PrereqType;
	has?: boolean;
}

export interface TraitPrereq extends BasePrereq {
	prereqs: Prereq[];
	all: boolean;
}
export type AttributePrereq = BasePrereq;
export type ContainedWeightPrereq = BasePrereq;
export type ContainedQuantityPrereq = BasePrereq;
export type SkillPrereq = BasePrereq;
export type SpellPrereq = BasePrereq;

const classes = {
	prereq_list: PrereqList,
	trait_prereq: TraitPrereq,
	attribute_prereq: AttributePrereq,
	contained_quantity_prereq: ContainedQuantityPrereq,
	contained_weight_prereq: ContainedWeightPrereq,
	skill_prereq: SkillPrereq,
	spell_prereq: SpellPrereq,
};
