export class DiceGURPS {
	count = 3;
	sides = 6;
	modifier = 0;
	multiplier = 1;

	constructor(d?: DiceGURPS) {
		if (d) Object.assign(this, d);
	}
}

export interface DiceGURPS {
	count: number;
	sides: number;
	modifier: number;
	multiplier: number;
}
