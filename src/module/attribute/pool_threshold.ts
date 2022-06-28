export type ThresholdOp = "halve_move" | "halve_dodge" | "halve_st";

export interface PoolThresholdDef {
	state: string;
	explanation?: string;
	multiplier?: number;
	divisor?: number;
	addition?: number;
	ops?: ThresholdOp[];
}

export class PoolThreshold {
	state = "";
	explanation = "";
	multiplier = 0;
	divisor = 1;
	addition = 0;
	ops: ThresholdOp[] = [];

	constructor(data: PoolThresholdDef) {
		Object.assign(this, data);
	}

	threshold(max: number): number {
		let divisor = this.divisor;
		if (divisor == 0) divisor = 1;
		return Math.round((max * this.multiplier) / this.divisor + this.addition);
	}
}
