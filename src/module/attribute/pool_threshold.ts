import { evaluateToNumber, VariableResolver } from "@util";

export type ThresholdOp = "halve_move" | "halve_dodge" | "halve_st";

export interface PoolThresholdDef {
	state: string;
	explanation?: string;
	expression?: string;
	// multiplier?: number;
	// divisor?: number;
	// addition?: number;
	ops?: ThresholdOp[];
}

export class PoolThreshold {
	state = "";
	explanation = "";
	expression = "";
	// multiplier = 0;
	// divisor = 1;
	// addition = 0;
	ops: ThresholdOp[] = [];

	constructor(data: PoolThresholdDef) {
		Object.assign(this, data);
	}

	threshold(resolver: VariableResolver): number {
		return evaluateToNumber(this.expression, resolver);
		// let divisor = this.divisor;
		// if (divisor == 0) divisor = 1;
		// return Math.round((max * this.multiplier) / this.divisor + this.addition);
	}
}
