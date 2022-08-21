import { CharacterGURPS } from "@actor";
import { Encumbrance } from "@actor/character/data";
import { SpellGURPS } from "@item";
import { ItemGURPS } from "@item/data";
import { DiceGURPS } from "@module/dice";
import { i18n } from "./misc";

export function registerHandlebarsHelpers() {
	Handlebars.registerHelper("concat", function (...args) {
		let outStr = "";
		args.forEach(arg => {
			if (typeof arg != "object") outStr += arg;
		});
		return outStr;
	});

	Handlebars.registerHelper("camelcase", function (s) {
		let n = "";
		s.split(" ").forEach((word: string) => {
			n = n + `<span class="first-letter">${word.substring(0, 1)}</span>${word.substring(1)} `;
		});
		return n;
	});

	Handlebars.registerHelper("input_lock", function (b: boolean) {
		return b ? "" : "disabled";
	});

	Handlebars.registerHelper("signed", function (n: number) {
		return n >= 0 ? `+${n}` : `${n}`;
	});

	Handlebars.registerHelper("or", function (...args) {
		let val = false;
		args.forEach(arg => {
			if (arg && typeof arg != "object") val = true;
		});
		return val;
	});

	Handlebars.registerHelper("and", function (...args) {
		let val = true;
		args.forEach(arg => {
			if (!arg && typeof arg != "object") val = false;
		});
		return val;
	});

	Handlebars.registerHelper("eq", function (a, b) {
		return a == b;
	});

	Handlebars.registerHelper("neq", function (a, b) {
		return a != b;
	});

	Handlebars.registerHelper("sum", function (...args) {
		const arr: number[] = [];
		for (const arg of args) {
			if (parseInt(arg)) arr.push(arg);
		}
		return arr.reduce((a, b) => a + b, 0);
	});

	Handlebars.registerHelper("enabledList", function (a: any[]) {
		return a.filter(e => !e.system.disabled);
	});

	Handlebars.registerHelper("notEmpty", function (a: any[]) {
		return !!a.length;
	});

	Handlebars.registerHelper("blockLayout", function (a: Array<string>, items: any) {
		if (!a) return "";
		let outStr = ``;
		let line_length = 2;
		for (const value of a) {
			let line = value.split(" ");
			if (line.length > line_length) line_length = line.length;
			line = line.filter((e: string) => !!items[e]?.length);
			if (!!line.length) {
				if (line_length > line.length) line = line.concat(Array(line_length - line.length).fill(line[0]));
				outStr += `\n"${line.join(" ")}"`;
			}
		}
		return outStr;
	});

	Handlebars.registerHelper("json", function (a: any) {
		return JSON.stringify(a);
	});

	Handlebars.registerHelper("not", function (a: any) {
		return !a;
	});

	Handlebars.registerHelper("join", function (a: any[], s: string): string {
		if (!a.length) return "";
		return a.join(s);
	});

	Handlebars.registerHelper("arr", function (...args) {
		const outArr: any[] = [];
		args.forEach(arg => {
			if (arg && typeof arg != "object") outArr.push(arg);
		});
		return outArr;
	});

	Handlebars.registerHelper("indent", function (i: ItemGURPS | number, init = -6, step = 12): string {
		let sum = init;
		if (typeof i == "number") sum += step * i;
		else sum += step * (i.parentCount ?? 0);
		return `style=\"padding-left: ${sum}px;\"`;
	});

	Handlebars.registerHelper("spellValues", function (i: SpellGURPS): string {
		const values = {
			resist: i.system.resist,
			spell_class: i.system.spell_class,
			casting_cost: i.system.casting_cost,
			maintenance_cost: i.system.maintenance_cost,
			casting_time: i.system.casting_time,
			duration: i.system.duration,
		};
		const list = [];
		for (const [k, v] of Object.entries(values)) {
			if (v && v != "-") list.push(`${i18n("gcsga.character.spells." + k)}: ${v}`);
		}
		return list.join("; ");
	});

	Handlebars.registerHelper("disabled", function (a: boolean): string {
		if (a) return "disabled";
		return "";
	});

	Handlebars.registerHelper("getMove", function (c: CharacterGURPS, level: Encumbrance): number {
		return c.move(level);
	});

	Handlebars.registerHelper("getDodge", function (c: CharacterGURPS, level: Encumbrance): number {
		return c.dodge(level);
	});

	Handlebars.registerHelper("date", function (str: string): string {
		const date = new Date(str);
		const options: any = { year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric" };
		options.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
		return date.toLocaleString("en-US", options);
	});

	Handlebars.registerHelper("length", function (...args: any[]): number {
		let length = 0;
		for (const a of args) {
			if ((typeof a == "number" || typeof a == "string") && `${a}`.length > length) length = `${a}`.length;
		}
		return length;
	});

	Handlebars.registerHelper("print", function (a: any): any {
		console.log(a);
		return a;
	});

	Handlebars.registerHelper("format", function (a: string): string {
		return (!!a ? a : "").replace(/\n/g, "<br>");
	});

	Handlebars.registerHelper("ref", function (a: string): string {
		if (a.includes("http")) return i18n("gcsga.character.link");
		return a;
	});

	// Handlebars.registerHelper("selected", function (list: any[], item: string): string {
	// 	console.warn(list);
	// 	if (list.includes(item)) return "selected";
	// 	return "";
	// });

	// may be temporary
	Handlebars.registerHelper("diceString", function (d: DiceGURPS): string {
		return new DiceGURPS(d).stringExtra(false);
	});
}
