import * as browserTabs from "./tabs";

export interface PackInfo {
	load: boolean;
	name: string;
}

export type TabName =
	| "trait"
	| "modifier"
	| "skill"
	| "spell"
	| "equipment"
	| "eqp_modifier"
	| "note";
export type BrowserTab = InstanceType<
	typeof browserTabs[keyof typeof browserTabs]
>;
export type TabData<T> = Record<TabName, T | null>;
