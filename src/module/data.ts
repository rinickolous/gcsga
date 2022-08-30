import { i18n, i18n_f, signed } from "@util";

export type LengthUnits =
	| "pt"
	| "in"
	| "ft"
	| "ft_in"
	| "yd"
	| "mi"
	| "mm"
	| "cm"
	| "km"
	| "m";
export type WeightUnits = "oz" | "lb" | "tn" | "lt" | "t" | "kg" | "g";
export type DisplayMode =
	| "not_shown"
	| "inline"
	| "tooltip"
	| "inline_and_tooltip";

export type Height = string;
export type Weight = string;

export enum DamageProgression {
	BasicSet = "basic_set",
	KnowingYourOwnStrength = "knowing_your_own_strength",
	NoSchoolGrognardDamage = "no_school_grognard_damage",
	ThrustEqualsSwingMinus2 = "thrust_equals_swing_minus_2",
	SwingEqualsThrustPlus2 = "swing_equals_thrust_plus_2",
	PhoenixFlameD3 = "phoenix_flame_d3",
}

export class LeveledAmount {
	level = 0;
	amount = 1;
	per_level = false;

	constructor(data?: { level: number; amount: number; per_level: boolean }) {
		if (data) Object.assign(this, data);
	}

	get formatWithLevel(): string {
		return this.format(i18n("gurps.feature.level"));
	}

	format(what: string): string {
		const per_level = signed(this.amount);
		if (this.per_level)
			return i18n_f("gurps.feature.format", {
				total: signed(this.adjustedAmount),
				per_level,
				what,
			});
		return per_level;
	}

	get adjustedAmount(): number {
		if (this.per_level) {
			if (this.level < 0) return 0;
			return this.amount * this.level;
		}
		return this.amount;
	}
}

export interface LeveledAmount {
	level: number;
	amount: number;
	per_level: boolean;

	formatWithLevel: string;
}

export interface StringCompare {
	compare: StringComparison;
	qualifier?: string;
}

export enum StringComparison {
	None = "none",
	Is = "is",
	IsNot = "is_not",
	Contains = "contains",
	DoesNotContain = "does_not_contain",
	StartsWith = "starts_with",
	DoesNotStartWith = "does_not_start_with",
	EndsWith = "ends_with",
	DoesNotEndWith = "does_not_end_with",
}

export interface NumberCompare {
	compare: NumberComparison;
	qualifier: number;
}

export enum NumberComparison {
	None = "none",
	Is = "is",
	IsNot = "is_not",
	AtLeast = "at_least",
	AtMost = "at_most",
}

// standard attribute related ids
export enum gid {
	All = "all",
	BasicMove = "basic_move",
	BasicSpeed = "basic_speed",
	Block = "block",
	ConditionalModifier = "conditional_modifier",
	Dexterity = "dx",
	Dodge = "dodge",
	Equipment = "equipment",
	EquipmentModifier = "equipment_modifier",
	FatiguePoints = "fp",
	FrightCheck = "fright_check",
	Health = "ht",
	Hearing = "hearing",
	HitPoints = "hp",
	Intelligence = "iq",
	Note = "note",
	Parry = "parry",
	Perception = "per",
	ReactionModifier = "reaction_modifier",
	RitualMagicSpell = "ritual_magic_spell",
	SizeModifier = "sm",
	Skill = "skill",
	Spell = "spell",
	Strength = "st",
	TasteSmell = "taste_smell",
	Technique = "technique",
	Ten = "10",
	Torso = "torso",
	Touch = "touch",
	Trait = "trait",
	TraitModifier = "trait_modifier",
	Vision = "vision",
	Will = "will",
}

export const attrPrefix = "attr.";

export enum CR {
	None = 0,
	CR6 = 6,
	CR9 = 9,
	CR12 = 12,
	CR15 = 15,
}

export enum CRAdjustment {
	None = "none",
	ActionPenalty = "action_penalty",
	ReactionPenalty = "reaction_penalty",
	FrightCheckPenalty = "fright_check_penalty",
	FrightCheckBonus = "fright_check_bonus",
	MinorCostOfLivingIncrease = "minor_cost_of_living_increase",
	MajorCostOfLivingIncrease = "major_cost_of_living_increase",
}

export enum Difficulty {
	Easy = "e",
	Average = "a",
	Hard = "h",
	VeryHard = "vh",
	Wildcard = "w",
}

export enum RollType {
	Skill = "skill",
	SkillRelative = "skill_rsl",
	Spell = "spell",
	SpellRelative = "spell_rsl",
	Attack = "attack",
	Damage = "damage",
	Modifier = "modifier",
}

export interface RollModifier {
	name: string;
	modifier: number;
	tags: string[];
}

export const rollModifiers: RollModifier[] = [
	{
		name: "Eye",
		modifier: -9,
		tags: ["hit_location"],
	},
	{
		name: "Skull",
		modifier: -7,
		tags: ["hit_location"],
	},
	{
		name: "Face",
		modifier: -5,
		tags: ["hit_location"],
	},
	{
		name: "Right Leg",
		modifier: -2,
		tags: ["hit_location"],
	},
	{
		name: "Right Leg",
		modifier: -2,
		tags: ["hit_location"],
	},
	{
		name: "Torso",
		modifier: 0,
		tags: ["hit_location"],
	},
	{
		name: "Groin",
		modifier: -3,
		tags: ["hit_location"],
	},
	{
		name: "Left Arm",
		modifier: -2,
		tags: ["hit_location"],
	},
	{
		name: "Left Leg",
		modifier: -2,
		tags: ["hit_location"],
	},
	{
		name: "Hand",
		modifier: -4,
		tags: ["hit_location"],
	},
	{
		name: "Foot",
		modifier: -4,
		tags: ["hit_location"],
	},
	{
		name: "Neck",
		modifier: -5,
		tags: ["hit_location"],
	},
	{
		name: "Vitals",
		modifier: -3,
		tags: ["hit_location"],
	},
	{
		name: "Shooting through light cover",
		modifier: -2,
		tags: ["ranged_combat"],
	},
	{
		name: "Target behind someone else (per intervening figure)",
		modifier: -4,
		tags: ["ranged_combat"],
	},
	{
		name: "Target crouching, kneeling, sitting, or lying down",
		modifier: -2,
		tags: ["ranged_combat"],
	},
	{
		name: "Target only partly exposed",
		modifier: -2,
		tags: ["ranged_combat"],
	},
	{
		name: "Laser sight",
		modifier: +1,
		tags: ["ranged_combat"],
	},
	{
		name: "Scope (per second of Aim, Max: Scope Acc)",
		modifier: +1,
		tags: ["ranged_combat"],
	},
	{
		name: "Unfamiliar weapon or targeting system",
		modifier: -2,
		tags: ["ranged_combat"],
	},
];

export type ImagePath = `${string}.${ImageFileExtension}`;
type ImageFileExtension = "jpg" | "jpeg" | "png" | "svg" | "webp";
