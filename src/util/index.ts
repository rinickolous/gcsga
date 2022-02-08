export function arrayBuffertoBase64(buffer: ArrayBuffer) {
	console.log(buffer);
	let binary = "";
	const bytes = new Uint8Array(buffer);
	const len = bytes.byteLength;
	for (let i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	console.log(binary);
	return binary;
}

export async function readTextFromFile(file: File) {
	const reader = new FileReader();
	return new Promise((resolve, reject) => {
		reader.onload = () => {
			resolve(reader.result);
		};
		reader.onerror = () => {
			reader.abort();
			reject();
		};
		reader.readAsText(file, "UTF-8");
	});
}

export function i18n(value: string, fallback?: string) {
	//@ts-ignore i18n
	const result = game.i18n.localize(value);
	if (!!fallback) return value === result ? fallback : result;
	return result;
}

export function i18n_f(value: string, data: object, fallback?: string) {
	//@ts-ignore i18n
	const template = game.i18n.has(value) ? value : fallback;
	if (!template) return value;
	//@ts-ignore i18n
	const result = game.i18n.format(template, data);
	if (!!fallback) return value === result ? fallback : result;
	return result;
}

export function signed(i: string | number) {
	if (typeof i == "string") i = parseFloat(i);
	if (i >= 0) return "+" + i.toString();
	return i.toString();
}

// export type CR = -1 | 0 | 6 | 9 | 12 | 15;
// export type CRAdjustment =
// 	| 'none'
// 	| 'action_penalty'
// 	| 'reaction_penalty'
// 	| 'fright_check_penalty'
// 	| 'fright_check_bonus'
// 	| 'minor_cost_of_living_increase'
// 	| 'major_cost_of_living_increase';

// export type PrereqType =
// 	| 'prereq_list'
// 	| 'attribute_prereq'
// 	| 'advantage_prereq'
// 	| 'skill_prereq'
// 	| 'spell_prereq'
// 	| 'contained_weight_prereq'
// 	| 'contained_quantity_prereq';
// export type StringComparison =
// 	| 'is'
// 	| 'is_not'
// 	| 'contains'
// 	| 'does_not_contain'
// 	| 'starts_with'
// 	| 'does_not_start_with'
// 	| 'ends_with'
// 	| 'does_not_end_with';
// export type NumberComparison = 'is' | 'at_least' | 'at_most';
// export type SpellPrereqSubType = 'name' | 'any' | 'college' | 'college_count' | 'category';

// export type FeatureType = 'attribute_bonus' | 'dr_bonus' | 'reaction_bonus' | 'conditional_modifier' | 'skill_bonus';
// export type StBonusLimitation = 'striking_only' | 'lifting_only' | 'throwing_only';
// export type SkillBonusSelectionType = 'skills_with_name' | 'weapons_with_name' | 'this_weapon';
// export type SpellBonusMatch = 'all_colleges' | 'college_name' | 'spell_name' | 'power_source_name';
// export type WeaponBonusSelectionType = 'weapons_with_required_skill' | 'weapons_with_name' | 'this_weapon';

// export type WeaponType = 'melee_weapon' | 'ranged_weapon';
// export type WeaponST = 'none' | 'thr' | 'sw' | 'thr_leveled' | 'sw_leveled';

// export interface StringCompare {
// 	compare: StringComparison;
// 	qualifier: string;
// }

// export interface NumberCompare {
// 	compare: NumberComparison;
// 	qualifier: number;
// }

// export interface PrereqList extends Prereq {
// 	all: boolean;
// 	prereqs: ObjArray<Prereq | PrereqList>;
// 	when_tl: NumberCompare;
// }

// export interface AttributePrereq extends Prereq {
// 	which: string;
// 	combined_with?: string;
// 	qualifier: NumberCompare;
// }

// export interface AdvantagePrereq extends Prereq {
// 	name?: StringCompare;
// 	level?: NumberCompare;
// 	notes?: StringCompare;
// }

// export interface SkillPrereq extends Prereq {
// 	name?: StringCompare;
// 	level?: NumberCompare;
// 	specialization?: StringCompare;
// }

// export interface SpellPrereq extends Prereq {
// 	sub_type: SpellPrereqSubType;
// 	qualifier?: StringCompare;
// 	quantity?: NumberCompare;
// }

// export interface ContainedWeightPrereq extends Prereq {
// 	qualifier: StringCompare;
// }

// export interface ContainedQuantityPrereq extends Prereq {
// 	qualifier: NumberCompare;
// }

// export interface Prereq {
// 	type: PrereqType;
// 	has: boolean;
// }

// export interface AttributeBonus extends Feature {
// 	attribute: string;
// 	limitation?: StBonusLimitation;
// }

// export interface DRBonus extends Feature {
// 	location: string;
// 	specialization?: string;
// }

// export interface ReactionBonus extends Feature {
// 	situation: string;
// }

// export interface ConditionalModifier extends Feature {
// 	situation: string;
// }

// export interface SkillBonus extends Feature {
// 	selection_type: SkillBonusSelectionType;
// 	name?: StringCompare;
// 	specialization?: StringCompare;
// 	category?: StringCompare;
// }

// export interface SkillPointBonus extends Feature {
// 	name?: StringCompare;
// 	specialization?: StringCompare;
// 	category?: StringCompare;
// }

// export interface SpellBonus extends Feature {
// 	match: SpellBonusMatch;
// 	name?: StringCompare;
// 	category?: StringCompare;
// }

// export interface SpellPointBonus extends Feature {
// 	match: SpellBonusMatch;
// 	name?: StringCompare;
// 	category?: StringCompare;
// }

// export interface WeaponBonus extends Feature {
// 	selection_type: WeaponBonusSelectionType;
// 	name?: StringCompare;
// 	specialization?: StringCompare;
// 	level?: NumberCompare;
// }

// export interface Feature {
// 	type: FeatureType;
// 	per_level: boolean;
// }

// export interface Weapon {
// 	type: WeaponType;
// 	damage: {
// 		type: string;
// 		st: WeaponST;
// 		//change to dice parser later
// 		base: string;
// 		armor_divisor: number;
// 		modifier_per_die: number;
// 	};
// 	//change to minimum ST parser
// 	strength: string;
// 	usage: string;
// 	usage_notes: string;
// 	calc: {
// 		level: number;
// 		damage: string;
// 	};
// 	defaults: ObjArray<Default>;
// }

// export interface MeleeWeapon extends Weapon {
// 	reach: string;
// 	//change to number parser?
// 	parry: string;
// 	block: string;
// 	calc: {
// 		level: number;
// 		parry: string;
// 		block: string;
// 		damage: string;
// 	};
// }

// export interface RangedWeapon {
// 	damage: {
// 		type: string;
// 		st: WeaponST;
// 		//change to dice parser later
// 		base: string;
// 		armor_divisor: number;
// 		fragmentation: string;
// 		fragmentation_armor_divisor: number;
// 		fragmentation_type: string;
// 		modifier_per_die: number;
// 	};
// 	accuracy: string;
// 	range: string;
// 	rate_of_fire: string;
// 	shots: string;
// 	bulk: string;
// 	recoil: string;
// 	calc: {
// 		level: number;
// 		range: string;
// 		damage: string;
// 	};
// }

// export interface Default {
// 	type: string;
// 	modifier: number;
// 	name?: string;
// 	specialization?: string;
// }

// export interface ObjArray<T> {
//     /**
//      * Takes an integer value and returns the item at that index,
//      * allowing for positive and negative integers.
//      * Negative integers count back from the last item in the array.
//      */
//      at(index: number): T | undefined;
// }
