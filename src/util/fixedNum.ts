export class fixedNum extends Number {
	constructor() {
		super();
	}

	static fromString(str: string): [number, Error | null] {
		if (str == "") return [0, new Error("Empty string is not valid")];
		return [parseFloat(str), null];
	}
}
