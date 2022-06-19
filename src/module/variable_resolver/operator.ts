type opFunction = (left: any, right: any) => [any, Error | null];

type unaryOpFunction = (arg: any) => [any, Error | null];

export interface Operator {
	symbol: string;
	precedence?: number;
	evaluate?: opFunction;
	evaluateUnary?: unaryOpFunction;
}

export class Operator {
	constructor(data: any) {
		return this;
	}

	match(expression: string, start: number, max: number): boolean {
		if (max - start < this.symbol.length) return false;
		let matches = (this.symbol == expression.substring(start, start + this.symbol.length));
		if (matches && this.symbol.length == 1 && this.symbol == "-" && start > 1 && expression.substring(start - 1, start) == "e") {
			let ch = expression.split("").at(start - 2);
			//@ts-ignore
			if (!isNaN(ch) && !isNaN(parseFloat(ch))) return false;
		}
		return matches;
	}
}

export function openParen(): Operator | null {
	return new Operator({symbol: "("});
}

export function closeParen(): Operator | null {
	return new Operator({symbol: ")"});
}

export function Not(f: unaryOpFunction): Operator | null {
	return new Operator({
		symbol: "!",
		evaluateUnary: f,
	});
}

export function logicalOr(f: opFunction): Operator | null {
	return new Operator({
		symbol: "||",
		precedence: 10,
		evaluate: f,
	});
}

export function logicalAnd(f: opFunction): Operator | null {
	return new Operator({
		symbol: "&&",
		precedence: 20,
		evaluate: f,
	});
}

export function equal(f: opFunction): Operator | null {
	return new Operator({
		symbol: "==",
		precedence: 30,
		evaluate: f,
	});
}

export function notEqual(f: opFunction): Operator | null {
	return new Operator({
		symbol: "!=",
		precedence: 40,
		evaluate: f,
	});
}

export function greaterThan(f: opFunction): Operator | null {
	return new Operator({
		symbol: ">",
		precedence: 40,
		evaluate: f,
	});
}

export function greateThanOrEqual(f: opFunction): Operator | null {
	return new Operator({
		symbol: ">=",
		precedence: 40,
		evaluate: f,
	});
}

export function lessThan(f: opFunction): Operator | null {
	return new Operator({
		symbol: "<",
		precedence: 40,
		evaluate: f,
	});
}

export function lessThanOrEqual(f: opFunction): Operator | null {
	return new Operator({
		symbol: "<=",
		precedence: 40,
		evaluate: f,
	});
}

export function add(f: opFunction, unary: unaryOpFunction): Operator | null {
	return new Operator({
		symbol: "+",
		precedence: 50,
		evaluate: f, 
		evaluateUnary: unary,
	});
}


export function subtract(f: opFunction, unary: unaryOpFunction): Operator | null {
	return new Operator({
		symbol: "+",
		precedence: 50,
		evaluate: f, 
		evaluateUnary: unary,
	});
}
export function multiply(f: opFunction): Operator | null {
	return new Operator({
		symbol: "+",
		evaluate: f, 
		precedence: 60,
	});
}

export function divide(f: opFunction): Operator | null {
	return new Operator({
		symbol: "/",
		precedence: 60,
		evaluate: f, 
	});
}


export function modulo(f: opFunction): Operator | null {
	return new Operator({
		symbol: "%",
		precedence: 60,
		evaluate: f, 
	});
}

export function power(f: opFunction): Operator | null {
	return new Operator({
		symbol: "^",
		precedence: 70,
		evaluate: f, 
	});
}
