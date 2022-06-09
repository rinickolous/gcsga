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

export type PrereqData =
	| PrereqListData
	| TraitPrereqData
	| AttributePrereqData
	| ContainedWeightPrereqData
	| ContainedQuantityPrereqData
	| SkillPrereqData
	| SpellPrereqData;

export interface BasePrereqData {
	type: PrereqType;
	has?: boolean;
}

export interface PrereqListData extends BasePrereqData {
	all: boolean;
	prereqs: Prereq[];
}

export interface TraitPrereqData extends BasePrereqData {}
export interface AttributePrereqData extends BasePrereqData {}
export interface ContainedWeightPrereqData extends BasePrereqData {}
export interface ContainedQuantityPrereqData extends BasePrereqData {}
export interface SkillPrereqData extends BasePrereqData {}
export interface SpellPrereqData extends BasePrereqData {}

export class Prereq {
	type: PrereqType;
	has?: boolean;

	constructor(data: PrereqData, context: PrereqConstructionContext = {}) {
		if (context.ready) {
			this.type = data.type;
		} else {
			this.type = data.type;
			mergeObject(context, {
				ready: true,
			});
			const PrereqConstructor = classes[data.type as PrereqType];
			return PrereqConstructor ? new PrereqConstructor(data, context) : new Prereq(data, context);
		}
	}

	static get default() {
		return new Prereq({type: "prereq_list", has: true})
	}
}

export class PrereqList extends Prereq {
	prereqs: Prereq[];
	all: boolean;

	constructor(data: PrereqData, context: PrereqConstructionContext = {}) {
		super(data, context);
		this.has = true;
		this.all = (data as PrereqListData).all ?? true;
		this.prereqs = [];
		if (!!(data as PrereqListData).prereqs) (data as PrereqListData).prereqs.forEach((e: Prereq) => {
			this.prereqs.push(new Prereq(e));
		});
	}
}

export class TraitPrereq extends Prereq { }
export class AttributePrereq extends Prereq { }
export class ContainedWeightPrereq extends Prereq { }
export class ContainedQuantityPrereq extends Prereq { }
export class SkillPrereq extends Prereq { }
export class SpellPrereq extends Prereq { }

export interface Prereq {
	type: PrereqType;
	has?: boolean;
}

export interface TraitPrereq extends Prereq {
	prereqs: Prereq[];
	all: boolean;
}
export interface AttributePrereq extends Prereq { }
export interface ContainedWeightPrereq extends Prereq { }
export interface ContainedQuantityPrereq extends Prereq { }
export interface SkillPrereq extends Prereq { }
export interface SpellPrereq extends Prereq { }


const classes = {
	prereq_list: PrereqList,
	trait_prereq: TraitPrereq,
	attribute_prereq: AttributePrereq,
	contained_quantity_prereq: ContainedQuantityPrereq,
	contained_weight_prereq: ContainedWeightPrereq,
	skill_prereq: SkillPrereq,
	spell_prereq: SpellPrereq,
}; 