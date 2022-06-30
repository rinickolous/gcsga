import { NumberCompare, StringCompare } from "@module/data";
import { v4 as uuidv4 } from "uuid";

let game: any;

export function i18n(value: string, fallback?: string): string {
	const result = game.i18n.localize(value);
	if (!!fallback) return value === result ? fallback : result;
	return result;
}

export function i18n_f(value: string, data: Record<string, unknown>, fallback?: string): string {
	const template = game.i18n.has(value) ? value : fallback;
	if (!template) return value;
	const result = game.i18n.format(template, data);
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
	switch (base.compare) {
		case "none":
			return true;
		case "is":
			return value.includes(base.qualifier);
		case "is_not":
			return !value.includes(base.qualifier);
		case "contains":
			for (const v of value) if (v.includes(base.qualifier)) return true;
			return false;
		case "does_not_contain":
			for (const v of value) if (v.includes(base.qualifier)) return false;
			return true;
		case "starts_with":
			for (const v of value) if (v.startsWith(base.qualifier)) return true;
			return false;
		case "does_not_start_with":
			for (const v of value) if (v.startsWith(base.qualifier)) return false;
			return true;
		case "ends_with":
			for (const v of value) if (v.endsWith(base.qualifier)) return true;
			return false;
		case "does_not_end_with":
			for (const v of value) if (v.endsWith(base.qualifier)) return false;
			return true;
	}
}

export function numberCompare(value: number, base?: NumberCompare): boolean {
	if (!base) return true;
	switch (base.compare) {
		case "none":
			return true;
		case "is":
			return value == base.qualifier;
		case "is_not":
			return value != base.qualifier;
		case "at_most":
			return value <= base.qualifier;
		case "at_least":
			return value >= base.qualifier;
	}
}

export function extractTechLevel(str: string): number {
	return Math.min(Math.max(0, parseInt(str)), 12);
}
