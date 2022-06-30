class DiceGURPS {
	sides = 6;
	count = 3;
	modifier = 0;
	multiplier = 1;

	constructor(data?: string | DiceGURPSDef) {
		if (data) {
			if (typeof data == "string") Object.assign(this, this.fromString(data));
			else Object.assign(this, data);
		}
	}

	fromString(str: string): DiceGURPSDef {
		str = str.trim();
		let dice: DiceGURPSDef = { sides: 6, count: 1, modifier: 0, multiplier: 1 };
		let i = 0;
		let ch: string;
		[dice.count, i] = extractValue(str, 0);
		const hadCount = i != 0;
		[ch, i] = nextChar(str, i);
		let hadSides = false;
		let hadD = false;
		if (ch.toLowerCase() == "d") {
			hadD = true;
			const j = i;
			[dice.sides] = extractValue(str, i);
			hadSides = i != j;
			[ch, i] = nextChar(str, i);
		}
		if (hadSides && !hadCount) {
			dice.count = 1;
		} else if (hadD && !hadSides && hadCount) {
			dice.sides = 6;
		}
		if (["+", "-"].includes(ch)) {
			const neg = ch == "-";
			[dice.modifier, i] = extractValue(str, i);
			if (neg) dice.modifier = -dice.modifier;
			[ch, i] = nextChar(str, i);
		}
		if (!hadD) {
			dice.modifier += dice.count;
			dice.count = 0;
		}
		if (ch.toLowerCase() == "x") [dice.multiplier] = extractValue(str, i);
		if (dice.multiplier == 0) dice.multiplier = 1;
		dice = normalize(dice);
		return dice;
	}

	toString(): string {
		let str = "";
		str += this.count;
		str += "d";
		if (this.sides != 6) str += this.sides;
		if (this.modifier) {
			if (this.modifier > 0) str += "+";
			str += this.modifier;
		}
		if (this.multiplier != 1) str += "x" + this.multiplier;
		return str;
	}
}

interface DiceGURPSDef {
	sides: number;
	count: number;
	modifier: number;
	multiplier: number;
}

function extractValue(str: string, i: number): [number, number] {
	let value = 0;
	while (i < str.length) {
		const ch = str[i];
		if (!ch.match("[0-9]")) return [value, i];
		value *= 10;
		value += parseInt(ch);
		i++;
	}
	return [value, i];
}

function nextChar(str: string, i: number): [string, number] {
	if (i < str.length) return [str[i], i + 1];
	return ["", i];
}

function normalize(dice: DiceGURPSDef): DiceGURPSDef {
	if (dice.count < 0) dice.count = 0;
	if (dice.sides < 0) dice.sides = 0;
	if (dice.multiplier < 1) dice.multiplier = 1;
	return dice;
}

export { DiceGURPS };
