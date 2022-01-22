export function registerHandlebarsHelpers() {
	Handlebars.registerHelper("concat", function (...args) {
		let outStr = "";
		args.forEach((arg) => {
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
		for (const arg of args) {
			if (arg) return true;
		}
		return false;
	});

	Handlebars.registerHelper("and", function (...args) {
		for (const arg of args) {
			if (!arg) return false;
		}
		return true;
	});

	Handlebars.registerHelper("eq", function (a, b) {
		return a == b;
	});

	Handlebars.registerHelper("sum", function (...args) {
		const arr: number[] = [];
		for (const arg of args) {
			if (parseInt(arg)) arr.push(arg);
		}
		return arr.reduce((a, b) => a + b, 0);
	});

	Handlebars.registerHelper("enabledList", function (a: any[]) {
		return a.filter((e) => !e.data.disabled);
	});

	Handlebars.registerHelper("notEmpty", function (a: any[]) {
		return !!a.length;
	});

	Handlebars.registerHelper("blockLayout", function (a: Array<string>, items: any) {
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
}
