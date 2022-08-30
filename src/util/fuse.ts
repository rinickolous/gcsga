import Fuse from "fuse.js";

// temporary options
const defaultOptions = {
	includeMatches: true,
	includeScore: true,
	keys: ["name", "system.notes", "system.tags"],
};

export function fSearch(
	list: any[],
	pattern: string,
	options: any = defaultOptions,
): any[] {
	const fuse = new Fuse(list, options);
	return fuse.search(pattern);
}
