import {
	add,
	closeParen,
	equal,
	greaterThan,
	greaterThanOrEqual,
	lessThan,
	lessThanOrEqual,
	logicalAnd,
	logicalOr,
	multiply,
	not,
	divide,
	modulo,
	notEqual,
	openParen,
	Operator,
	opFunction,
	power,
	subtract,
} from "@module/operator";
import { fixedNum } from "@util/fixedNum";

export function fixedOperators(dbzrz: boolean): Operator[] {
	let eDivide: opFunction;
	let eModulo: opFunction;
	if (dbzrz) {
		eDivide = fixedDivideAllowDivideByZero;
		eModulo = fixedModuloAllowDivideByZero;
	} else {
		eDivide = fixedDivide;
		eModulo = fixedModulo;
	}

	return [
		openParen(),
		closeParen(),
		not(fixedNot),
		logicalOr(fixedLogicalOr),
		logicalAnd(fixedLogicalAnd),
		equal(fixedEqual),
		notEqual(fixedNotEqual),
		greaterThan(fixedGreaterThan),
		greaterThanOrEqual(fixedGreaterThanOrEqual),
		lessThan(fixedLessThan),
		lessThanOrEqual(fixedLessThanOrEqual),
		add(fixedAdd, fixedAddUnary),
		subtract(fixedSubtract, fixedSubtractUnary),
		multiply(fixedMultiply),
		divide(eDivide),
		modulo(eModulo),
		power(fixedPower),
	];
}

function fixedNot(arg: any): [any, Error | null] {
	const b = Boolean(arg);
	if (typeof b == "boolean") return [!b, null];
	const [v, err] = fixedFrom(arg);
	if (err) return [null, err];
	if (v == 0) return [true, null];
	return [false, null];
}

function fixedLogicalOr(left: any, right: any): [any, Error | null] {
	let [l, err] = fixedFrom(left);
	if (err) return [null, err];
	if (l != 0) return [true, null];
	let r = 0;
	[r, err] = fixedFrom(right);
	if (err) return [null, err];
	return [r != 0, null];
}

function fixedLogicalAnd(left: any, right: any): [any, Error | null] {
	let [l, err] = fixedFrom(left);
	if (err) return [null, err];
	if (l == 0) return [false, null];
	let r = 0;
	[r, err] = fixedFrom(right);
	if (err) return [null, err];
	return [r != 0, null];
}

function fixedEqual(left: any, right: any): [any, Error | null] {
	let r = 0;
	let [l, err] = fixedFrom(left);
	if (!err) [r, err] = fixedFrom(right);
	if (err) return [l.toString() == r.toString(), null];
	return [l == r, null];
}

function fixedNotEqual(left: any, right: any): [any, Error | null] {
	let r = 0;
	let [l, err] = fixedFrom(left);
	if (!err) [r, err] = fixedFrom(right);
	if (err) return [l.toString() != r.toString(), null];
	return [l != r, null];
}

function fixedGreaterThan(left: any, right: any): [any, Error | null] {
	let r = 0;
	let [l, err] = fixedFrom(left);
	if (!err) [r, err] = fixedFrom(right);
	if (err) return [l.toString() > r.toString(), null];
	return [l > r, null];
}

function fixedGreaterThanOrEqual(left: any, right: any): [any, Error | null] {
	let r = 0;
	let [l, err] = fixedFrom(left);
	if (!err) [r, err] = fixedFrom(right);
	if (err) return [l.toString() >= r.toString(), null];
	return [l >= r, null];
}

function fixedLessThan(left: any, right: any): [any, Error | null] {
	let r = 0;
	let [l, err] = fixedFrom(left);
	if (!err) [r, err] = fixedFrom(right);
	if (err) return [l.toString() < r.toString(), null];
	return [l < r, null];
}

function fixedLessThanOrEqual(left: any, right: any): [any, Error | null] {
	let r = 0;
	let [l, err] = fixedFrom(left);
	if (!err) [r, err] = fixedFrom(right);
	if (err) return [l.toString() <= r.toString(), null];
	return [l <= r, null];
}

function fixedAdd(left: any, right: any): [any, Error | null] {
	console.log(left, right);
	let r = 0;
	let [l, err] = fixedFrom(left);
	if (!err) [r, err] = fixedFrom(right);
	if (err) return [l.toString() + r.toString(), null];
	return [l + r, null];
}

function fixedAddUnary(arg: any): [any, Error | null] {
	return fixedFrom(arg);
}

function fixedSubtract(left: any, right: any): [any, Error | null] {
	let [l, err] = fixedFrom(left);
	if (err) return [null, err];
	let r = 0;
	[r, err] = fixedFrom(right);
	if (err) return [null, err];
	return [l - r, null];
}

function fixedSubtractUnary(arg: any): [any, Error | null] {
	const [v, err] = fixedFrom(arg);
	if (err) return [null, err];
	return [-v, null];
}

function fixedMultiply(left: any, right: any): [any, Error | null] {
	let [l, err] = fixedFrom(left);
	if (err) return [null, err];
	let r = 0;
	[r, err] = fixedFrom(right);
	if (err) return [null, err];
	return [l * r, null];
}

function fixedDivide(left: any, right: any): [any, Error | null] {
	let [l, err] = fixedFrom(left);
	if (err) return [null, err];
	let r = 0;
	[r, err] = fixedFrom(right);
	if (err) return [null, err];
	if (r == 0) return [null, new Error("Divide by zero")];
	return [l / r, null];
}

function fixedDivideAllowDivideByZero(left: any, right: any): [any, Error | null] {
	let [l, err] = fixedFrom(left);
	if (err) return [null, err];
	let r = 0;
	[r, err] = fixedFrom(right);
	if (err) return [null, err];
	if (r == 0) return [r, null];
	return [l / r, null];
}

function fixedModulo(left: any, right: any): [any, Error | null] {
	let [l, err] = fixedFrom(left);
	if (err) return [null, err];
	let r = 0;
	[r, err] = fixedFrom(right);
	if (err) return [null, err];
	if (r == 0) return [null, new Error("Divide by zero")];
	return [l % r, null];
}

function fixedModuloAllowDivideByZero(left: any, right: any): [any, Error | null] {
	let [l, err] = fixedFrom(left);
	if (err) return [null, err];
	let r = 0;
	[r, err] = fixedFrom(right);
	if (err) return [null, err];
	if (r == 0) return [r, null];
	return [l % r, null];
}

function fixedPower(left: any, right: any): [any, Error | null] {
	let [l, err] = fixedFrom(left);
	if (err) return [null, err];
	let r = 0;
	[r, err] = fixedFrom(right);
	if (err) return [null, err];
	return [Math.pow(l, r), null];
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
			return fixedNum.fromString(arg);
		default:
			return [0, new Error(`Not a number: ${arg}`)];
	}
}
