import { add, closeParen, equal, greaterThan, greaterThanOrEqual, lessThan, lessThanOrEqual, logicalAnd, logicalOr, multiply, not, divide, modulo, notEqual, openParen, Operator, opFunction, power, subtract } from "./types";

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

function fixedNot(arg: any): any {
	const b = Boolean(arg);
	if (typeof b == "boolean") return !b;
	const v = fixedFrom(arg);
	if (v == 0) return true;
	return false;
}

function fixedLogicalOr(left: any, right: any): any {
	const l = fixedFrom(left);
	if (l != 0) return true;
	let r = 0;
	r = fixedFrom(right);
	return r != 0;
}

function fixedLogicalAnd(left: any, right: any): any {
	const l = fixedFrom(left);
	if (l == 0) return false;
	let r = 0;
	r = fixedFrom(right);
	return r != 0;
}

function fixedEqual(left: any, right: any): any {
	let l, r;
	try {
		l = fixedFrom(left);
		r = fixedFrom(right);
	} catch (err) {
		console.error(err);
		return left.toString() == right.toString();
	}
	return l == r;
}

function fixedNotEqual(left: any, right: any): any {
	let l, r;
	try {
		l = fixedFrom(left);
		r = fixedFrom(right);
	} catch (err) {
		console.error(err);
		return left.toString() != right.toString();
	}
	return l != r;
}

function fixedGreaterThan(left: any, right: any): any {
	let l, r;
	try {
		l = fixedFrom(left);
		r = fixedFrom(right);
	} catch (err) {
		console.error(err);
		return left.toString() > right.toString();
	}
	return l > r;
}

function fixedGreaterThanOrEqual(left: any, right: any): any {
	let l, r;
	try {
		l = fixedFrom(left);
		r = fixedFrom(right);
	} catch (err) {
		console.error(err);
		return left.toString() >= right.toString();
	}
	return l >= r;
}

function fixedLessThan(left: any, right: any): any {
	let l, r;
	try {
		l = fixedFrom(left);
		r = fixedFrom(right);
	} catch (err) {
		console.error(err);
		return left.toString() < right.toString();
	}
	return l < r;
}

function fixedLessThanOrEqual(left: any, right: any): any {
	let l, r;
	try {
		l = fixedFrom(left);
		r = fixedFrom(right);
	} catch (err) {
		console.error(err);
		return left.toString() <= right.toString();
	}
	return l <= r;
}

function fixedAdd(left: any, right: any): any {
	let l, r;
	try {
		l = fixedFrom(left);
		r = fixedFrom(right);
	} catch (err) {
		console.error(err);
		return left.toString() + right.toString();
	}
	return l + r;
}

function fixedAddUnary(arg: any): any {
	return fixedFrom(arg);
}

function fixedSubtract(left: any, right: any): any {
	const l = fixedFrom(left);
	let r = 0;
	r = fixedFrom(right);
	return l - r;
}

function fixedSubtractUnary(arg: any): any {
	const v = fixedFrom(arg);
	return -v;
}

function fixedMultiply(left: any, right: any): any {
	const l = fixedFrom(left);
	let r = 0;
	r = fixedFrom(right);
	return l * r;
}

function fixedDivide(left: any, right: any): any {
	const l = fixedFrom(left);
	let r = 0;
	r = fixedFrom(right);
	if (r == 0) throw new Error("Divide by zero");
	return l / r;
}

function fixedDivideAllowDivideByZero(left: any, right: any): any {
	const l = fixedFrom(left);
	let r = 0;
	r = fixedFrom(right);
	if (r == 0) return r;
	return l / r;
}

function fixedModulo(left: any, right: any): any {
	const l = fixedFrom(left);
	let r = 0;
	r = fixedFrom(right);
	if (r == 0) throw new Error("Divide by zero");
	return l % r;
}

function fixedModuloAllowDivideByZero(left: any, right: any): any {
	const l = fixedFrom(left);
	let r = 0;
	r = fixedFrom(right);
	if (r == 0) return r;
	return l % r;
}

function fixedPower(left: any, right: any): any {
	const l = fixedFrom(left);
	let r = 0;
	r = fixedFrom(right);
	return Math.pow(l, r);
}

function fixedFrom(arg: any): number {
	const a = typeof arg;
	switch (a) {
		case "boolean":
			if (arg) return 1;
			return 0;
		case "number":
			return arg;
		case "string":
			return parseFloat(arg);
		default:
			throw new Error(`Not a number: ${arg}`);
	}
}
