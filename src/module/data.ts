export class RollRange extends String {
	roll() {
		const match = this.match(/([\d]*)-([\d]*)/);
		if (match) return [!!match[1] ? parseInt(match[1]) : 0, !!match[2] ? parseInt(match[2]) : 0];
	}
}

export type LengthUnits = "pt" | "in" | "ft" | "ft_in" | "yd" | "mi" | "mm" | "cm" | "km" | "m";
export type WeightUnits = "oz" | "lb" | "tn" | "lt" | "t" | "kg" | "g";
export type DisplayMode = "not_shown" | "inline" | "tooltip" | "inline_and_tooltip";

export type Height = string;
export type Weight = string;

export class RollGURPS extends String {
	roll() {
		const multiplier = this.match(/([\d]+)d/);
		const dice = this.match(/d([\d]*)/);
		const addition = this.match(/([-\d]+)(?!d.*)/);
		return [multiplier ? parseInt(multiplier[1]) : 0, dice ? parseInt(dice[1]) : 6, addition ? addition[1] : 0];
	}
}

// Object Array
export class ObjArray<T> {
	push(...items: T[]): number {
		return Array.prototype.push(this, ...items);
	}
	forEach(callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any): void {
		return Array.prototype.forEach(callbackfn);
	}
	constructor(a: Array<T>) {
		return Object.assign(this, a);
	}
}

export interface ObjArray<T> extends Array<T> {
	length: number;
	at(index: number): T | undefined;
}

// String Compare
export const StringComparison = [
	"is",
	"is_not",
	"contains",
	"does_not_contain",
	"starts_with",
	"does_not_start_with",
	"ends_with",
	"does_not_end_with",
] as const;
export type StringComparison = typeof StringComparison[number];

export interface StringCompare {
	compare: StringComparison;
	qualifier: string;
}

// Number Compare
export const NumberComparison = ["is", "at_least", "at_most"] as const;
export type NumberComparison = typeof NumberComparison[number];

export interface NumberCompare {
	compare: NumberComparison;
	qualifier: number;
}

// Prerequisite
export const PrereqType = [
	"prereq_list",
	"attribute_prereq",
	"trait_prereq",
	"skill_prereq",
	"spell_prereq",
	"contained_weight_prereq",
	"contained_quantity_prereq",
] as const;
export type PrereqType = typeof PrereqType[number];

export interface Prereq {
	type: PrereqType;
	has: boolean;
}

export interface AttributePrereq extends Prereq {
	which: string;
	combined_with?: string;
	qualifier: NumberCompare;
}

export interface TraitPrereq extends Prereq {
	name?: StringCompare;
	level?: NumberCompare;
	notes?: StringCompare;
}

export interface SkillPrereq extends Prereq {
	name?: StringCompare;
	level?: NumberCompare;
	specialization?: StringCompare;
}

export interface SpellPrereq extends Prereq {
	sub_type: SpellPrereqSubType;
	qualifier?: StringCompare;
	quantity?: NumberCompare;
}

export interface ContainedWeightPrereq extends Prereq {
	qualifier: StringCompare;
}

export interface ContainedQuantityPrereq extends Prereq {
	qualifier: NumberCompare;
}

// Feature
export const FeatureType = [
	"attribute_bonus",
	"dr_bonus",
	"reaction_bonus",
	"conditional_modifier",
	"skill_bonus",
	"skill_point_bonus",
	"spell_bonus",
	"spell_point_bonus",
	"weapon_bonus",
] as const;
export type FeatureType = typeof FeatureType[number];

export interface Feature {
	type: FeatureType;
	per_level: boolean;
}

export interface AttributeBonus extends Feature {
	attribute: string;
	limitation?: StrengthBonusLimitation;
}

export interface DRBonus extends Feature {
	location: string;
	specialization?: string;
}

export interface ReactionBonus extends Feature {
	situation: string;
}

export interface ConditionalModifier extends Feature {
	situation: string;
}

export interface SkillBonus extends Feature {
	selection_type: SkillBonusSelectionType;
	name?: StringCompare;
	specialization?: StringCompare;
	category?: StringCompare;
}

export interface SkillPointBonus extends Feature {
	name?: StringCompare;
	specialization?: StringCompare;
	category?: StringCompare;
}

export interface SpellBonus extends Feature {
	match: SpellBonusMatch;
	name?: StringCompare;
	category?: StringCompare;
}

export interface SpellPointBonus extends Feature {
	match: SpellBonusMatch;
	name?: StringCompare;
	category?: StringCompare;
}

export interface WeaponBonus extends Feature {
	selection_type: WeaponBonusSelectionType;
	name?: StringCompare;
	specialization?: StringCompare;
	level?: NumberCompare;
}

// Weapon
export const WeaponType = ["melee_weapon", "ranged_weapon"] as const;
export type WeaponType = typeof WeaponType[number];

export interface Weapon {
	type: WeaponType;
	damage: {
		type: string;
		st: WeaponST;
		//change to dice parser later
		base: string;
		armor_divisor: number;
		modifier_per_die: number;
	};
	//change to minimum ST parser
	strength: string;
	usage: string;
	usage_notes: string;
	calc: {
		level: number;
		damage: string;
	};
	defaults: ObjArray<Default>;
}

export interface MeleeWeapon extends Weapon {
	reach: string;
	//change to number parser?
	parry: string;
	block: string;
	calc: {
		level: number;
		parry: string;
		block: string;
		damage: string;
	};
}

export interface RangedWeapon {
	damage: {
		type: string;
		st: WeaponST;
		//change to dice parser later
		base: string;
		armor_divisor: number;
		fragmentation: string;
		fragmentation_armor_divisor: number;
		fragmentation_type: string;
		modifier_per_die: number;
	};
	accuracy: string;
	range: string;
	rate_of_fire: string;
	shots: string;
	bulk: string;
	recoil: string;
	calc: {
		level: number;
		range: string;
		damage: string;
	};
}

// Default
export interface Default {
	type: string;
	modifier: number;
	name?: string;
	specialization?: string;
}

export const CR = [-1, 0, 6, 9, 12, 15] as const;
export type CR = typeof CR[number];

export const CRAdjustment = [
	"none",
	"action_penalty",
	"reaction_penalty",
	"fright_check_penalty",
	"fright_check_bonus",
	"minor_cost_of_living_increase",
	"major_cost_of_living_increase",
] as const;
export type CRAdjustment = typeof CRAdjustment[number];

export const SpellPrereqSubType = ["name", "any", "college", "college_count", "category"] as const;
export type SpellPrereqSubType = typeof SpellPrereqSubType[number];

export const StrengthBonusLimitation = ["striking_only", "lifting_only", "throwing_only"] as const;
export type StrengthBonusLimitation = typeof StrengthBonusLimitation[number];

export const SkillBonusSelectionType = ["skills_with_name", "weapons_with_name", "this_weapon"] as const;
export type SkillBonusSelectionType = typeof SkillBonusSelectionType[number];

export const SpellBonusMatch = ["all_colleges", "college_name", "spell_name", "power_source_name"] as const;
export type SpellBonusMatch = typeof SpellBonusMatch[number];

export const WeaponBonusSelectionType = ["weapons_with_required_skill", "weapons_with_name", "this_weapon"] as const;
export type WeaponBonusSelectionType = typeof WeaponBonusSelectionType[number];

export const WeaponST = ["none", "thr", "sw", "thr_leveled", "sw_leveled"] as const;
export type WeaponST = typeof WeaponST[number];
