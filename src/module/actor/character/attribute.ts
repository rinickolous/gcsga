import { VariableResolver } from "@module/variable_resolver";

export class Attribute {
	id: string;
	type: AttributeType;
	name: string;
	full_name: string;
	attribute_base: string;
	cost_per_point: number;
	cost_adj_percent_per_sm: number;
	thresholds: PoolThreshold[];
	order: number;

	constructor(data: Attribute) {
		this.id = data.id;
		this.type = data.type;
		this.name = data.name;
		this.full_name = data.full_name;
		this.attribute_base = data.attribute_base;
		this.cost_per_point = data.cost_per_point;
		this.cost_adj_percent_per_sm = data.cost_adj_percent_per_sm;
		this.thresholds = data.thresholds;
		this.order = data.order;
	}


	get priamry() {
		return this.attribute_base == parseFloat(this.attribute_base).toString();
	}

	get BaseValue() {
		const vr = new VariableResolver();
		return vr.evaluateToNumber(this.attribute_base);
	}
}

export type AttributeType = "integer" | "decimal" | "pool";

export type PoolThresholdOp = "halve_move" | "halve_dodge" | "halve_st";

export interface PoolThreshold {
	state: string;
	explanation: string;
	multiplier: number;
	divisor: number;
	addition: number;
	ops: PoolThresholdOp[];
}
