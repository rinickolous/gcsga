import { ActorGURPS } from "@actor";
import { NumberCompare, NumberComparison, StringCompare, StringComparison } from "@module/data";
import { v4 as uuidv4 } from "uuid";

export function i18n(value: string, fallback?: string): string {
	const result = (game as Game).i18n.localize(value);
	if (!!fallback) return value === result ? fallback : result;
	return result;
}

export function i18n_f(value: string, data: Record<string, unknown>, fallback?: string): string {
	const template = (game as Game).i18n.has(value) ? value : fallback;
	if (!template) return value;
	const result = (game as Game).i18n.format(template, data);
	if (!!fallback) return value === result ? fallback : result;
	return result;
}

export function signed(i: string | number): string {
	if (typeof i == "string") i = parseFloat(i);
	if (i >= 0) return "+" + i.toString();
	return i.toString();
}

export function sanitize(id: string, permit_leading_digits: boolean, reserved: string[]): string {
	const buffer: string[] = [];
	for (let ch of id.split("")) {
		if (ch.match("[A-Z]")) ch = ch.toLowerCase();
		if (ch == "_" || ch.match("[a-z]") || (ch.match("[0-9]") && (permit_leading_digits || buffer.length > 0)))
			buffer.push(ch);
	}
	if (buffer.length == 0) buffer.push("_");
	let ok = true;
	while (ok) {
		ok = true;
		id = buffer.join("");
		for (const r of reserved) {
			if (r == id) {
				buffer.push("_");
				ok = false;
				break;
			}
		}
		if (ok) return id;
	}
	// cannot reach
	return "";
}

export function newUUID(): string {
	return uuidv4();
}

export function getCurrentTime(): string {
	return new Date().toISOString();
}

export function stringCompare(value?: string | string[] | null, base?: StringCompare): boolean {
	if (!base) return true;
	if (!value) return false;
	if (typeof value == "string") value = [value];
	value = value.map(e => {
		return e.toLowerCase();
	});
	switch (base.compare) {
		case StringComparison.None:
			return true;
		case StringComparison.Is:
			return !!base.qualifier && value.includes(base.qualifier);
		case StringComparison.IsNot:
			return !!base.qualifier && !value.includes(base.qualifier);
		case StringComparison.Contains:
			for (const v of value) if (base.qualifier && v.includes(base.qualifier)) return true;
			return false;
		case StringComparison.DoesNotContain:
			for (const v of value) if (base.qualifier && v.includes(base.qualifier)) return false;
			return true;
		case StringComparison.StartsWith:
			for (const v of value) if (base.qualifier && v.startsWith(base.qualifier)) return true;
			return false;
		case StringComparison.DoesNotStartWith:
			for (const v of value) if (base.qualifier && v.startsWith(base.qualifier)) return false;
			return true;
		case StringComparison.EndsWith:
			for (const v of value) if (base.qualifier && v.endsWith(base.qualifier)) return true;
			return false;
		case StringComparison.DoesNotEndWith:
			for (const v of value) if (base.qualifier && v.endsWith(base.qualifier)) return false;
			return true;
	}
}

export function numberCompare(value: number, base?: NumberCompare): boolean {
	if (!base) return true;
	switch (base.compare) {
		case NumberComparison.None:
			return true;
		case NumberComparison.Is:
			return value == base.qualifier;
		case NumberComparison.IsNot:
			return value != base.qualifier;
		case NumberComparison.AtMost:
			return value <= base.qualifier;
		case NumberComparison.AtLeast:
			return value >= base.qualifier;
	}
}

export function extractTechLevel(str: string): number {
	return Math.min(Math.max(0, parseInt(str)), 12);
}

type WeightValueType =
	| "weight_addition"
	| "weight_percentage_addition"
	| "weight_percentage_multiplier"
	| "weight_multiplier";

export function determineModWeightValueTypeFromString(s: string): WeightValueType {
	s = s.toLowerCase().trim();
	if (s.endsWith("%")) {
		if (s.startsWith("x")) return "weight_percentage_multiplier";
		return "weight_percentage_addition";
	} else if (s.endsWith("x") || s.startsWith("x")) return "weight_multiplier";
	return "weight_addition";
}

export interface Fraction {
	numerator: number;
	denominator: number;
}

export function extractFraction(s: string): Fraction {
	let v = s.trim();
	while (v.length > 0 && v[-1].match("[0-9]")) {
		v = v.substring(0, v.length - 1);
	}
	const f = v.split("/");
	const fraction: Fraction = { numerator: parseInt(f[0]) || 0, denominator: parseInt(f[1]) || 1 };
	const revised = determineModWeightValueTypeFromString(s);
	if (revised == "weight_percentage_multiplier") {
		if (fraction.numerator <= 0) {
			fraction.numerator = 100;
			fraction.denominator = 1;
		}
	} else if (revised == "weight_multiplier") {
		if (fraction.numerator <= 0) {
			fraction.numerator = 1;
			fraction.denominator = 1;
		}
	}
	return fraction;
}

export function dollarFormat(i: number): string {
	const formatter = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
	});
	return formatter.format(i);
}
