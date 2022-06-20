import { Evaluator } from "@module/evaluator";

type eFunction = (evaluator: Evaluator | null, options: string) => [any, Error];

export function fixedFunctions(): Map<string, eFunction> {
	const m = new Map();
	m.set("abs", fixedAbsolute);
	m.set("cbrt", fixedCubeRoot);
	m.set("ceil", fixedCeiling);
	m.set("exp", fixedBaseEExpontential);
	m.set("exp2", fixedBase2Expontential);
	m.set("floor", fixedFloor);
	m.set("if", fixedIf);
	m.set("log", fixedNaturalLog);
	m.set("log1p", fixedNaturalLogSum);
	m.set("log10", fixedDecimalLog);
	m.set("max", fixedMaximum);
	m.set("min", fixedMinimum);
	m.set("round", fixedRound);
	m.set("sqrt", fixedSqrt);
	return m;
}

function fixedAbsolute(e: Evaluator, args: string): [any, Error | null] {
	const [value, err] = evalToFixed(e, args);
	if (err) return [null, err];
	return [Math.abs(value), null];
}

function fixedCubeRoot(e: Evaluator, args: string): [any, Error | null] {
	const [value, err] = evalToFixed(e, args);
	if (err) return [null, err];
	return [Math.cbrt(value), null];
}

function fixedCeiling(e: Evaluator, args: string): [any, Error | null] {
	const [value, err] = evalToFixed(e, args);
	if (err) return [null, err];
	return [Math.ceil(value), null];
}

function fixedBaseEExpontential(e: Evaluator, args: string): [any, Error | null] {
	const [value, err] = evalToFixed(e, args);
	if (err) return [null, err];
	return [Math.exp(value), null];
}

function fixedBase2Expontential(e: Evaluator, args: string): [any, Error | null] {
	const [value, err] = evalToFixed(e, args);
	if (err) return [null, err];
	return [2 ** value, null];
}

function fixedFloor(e: Evaluator, args: string): [any, Error | null] {
	const [value, err] = evalToFixed(e, args);
	if (err) return [null, err];
	return [Math.floor(value), null];
}

function fixedIf(e: Evaluator, args: string): [any, Error | null] {
	let arg: string;
	[arg, args] = nextArg(args);
	let [evaluated, err]: [any, Error | null] = [null, null];
	[evaluated, err] = e.evaluateNew(arg);
	if (err) return [null, err];
	let value: number;
	[value, err] = fixedFrom(evaluated);
	if (err) {
		if (typeof evaluated == "string") {
			if (evaluated && evaluated == "false") {
				value = value;
			}
		} else {
			return [null, err];
		}
	}
	if (value == 0) {
		[, args] = nextArg(args);
	}
	[arg] = nextArg(args);
	return e.evaluateNew(arg);
}

function fixedMaximum(e: Evaluator, args: string): [any, Error | null] {
	let max: number = Math.max();
	while (args) {
		let arg: string;
		[arg, args] = nextArg(args);
		const [value, err] = evalToFixed(e, arg);
		if (err) return [null, err];
		max = Math.max(max, value);
	}
	return [max, null];
}

function fixedMinimum(e: Evaluator, args: string): [any, Error | null] {
	let min: number = Math.min();
	while (args) {
		let arg: string;
		[arg, args] = nextArg(args);
		const [value, err] = evalToFixed(e, arg);
		if (err) return [null, err];
		min = Math.min(min, value);
	}
	return [min, null];
}

function fixedNaturalLog(e: Evaluator, args: string): [any, Error | null] {
	const [value, err] = evalToFixed(e, args);
	if (err) return [null, err];
	return [Math.log(value), null];
}

function fixedNaturalLogSum(e: Evaluator, args: string): [any, Error | null] {
	const [value, err] = evalToFixed(e, args);
	if (err) return [null, err];
	return [Math.log1p(value), null];
}

function fixedDecimalLog(e: Evaluator, args: string): [any, Error | null] {
	const [value, err] = evalToFixed(e, args);
	if (err) return [null, err];
	return [Math.log10(value), null];
}

function fixedRound(e: Evaluator, args: string): [any, Error | null] {
	const [value, err] = evalToFixed(e, args);
	if (err) return [null, err];
	return [Math.round(value), null];
}

function fixedSqrt(e: Evaluator, args: string): [any, Error | null] {
	const [value, err] = evalToFixed(e, args);
	if (err) return [null, err];
	return [Math.sqrt(value), null];
}

function evalToFixed(e: Evaluator, arg: string): [number, Error | null] {
	const [evaluated, err] = e.evaluateNew(arg);
	if (err) return [0, err];
	return fixedFrom(evaluated);
}

function fixedFrom(arg: any): [number, Error | null] {
	const a = typeof arg;
	switch (a) {
		case "boolean":
			if (arg) return [1, null];
			return [0, null];
		case "number":
			return [arg, null];
		case "string":
			return [parseFloat(arg), null];
		default:
			return [0, new Error(`Not a number: ${arg}`)];
	}
}

function nextArg(args: string): [string, string] {
	let parens = 0;
	for (let i = 0; i < args.length; i++) {
		const ch = args[i];
		if (ch == "(") parens++;
		else if (ch == ")") parens--;
		else if (ch == "," && parens == 0) return [args.substring(0, i), args.substring(i + 1)];
	}
	return [args, ""];
}
