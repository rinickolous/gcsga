export type LengthUnits = "pt" | "in" | "ft" | "ft_in" | "yd" | "mi" | "mm" | "cm" | "km" | "m";
export type WeightUnits = "oz" | "lb" | "tn" | "lt" | "t" | "kg" | "g";
export type DisplayMode = "not_shown" | "inline" | "tooltip" | "inline_and_tooltip";

// TODO: change
export type Height = `${number} ${LengthUnits}` | `${number}'` | `${number}'${number}"`;
export type Weight = `${number} ${WeightUnits}`;

export enum DamageProgression {
	BasicSet = "basic_set",
	KnowingYourOwnStrength = "knowing_your_own_strength",
	NoSchoolGrognardDamage = "no_school_grognard_damage",
	ThrustEqualsSwingMinus2 = "thrust_equals_swing_minus_2",
	SwingEqualsThrustPlus2 = "swing_equals_thrust_plus_2",
	PhoenixFlameD3 = "phoenix_flame_d3",
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

// Standard attribute related ids
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
		tags: ["Hit Location"],
	},
	{
		name: "Skull",
		modifier: -7,
		tags: ["Hit Location"],
	},
	{
		name: "Face",
		modifier: -5,
		tags: ["Hit Location"],
	},
	{
		name: "Right Leg",
		modifier: -2,
		tags: ["Hit Location"],
	},
	{
		name: "Right Leg",
		modifier: -2,
		tags: ["Hit Location"],
	},
	{
		name: "Torso",
		modifier: 0,
		tags: ["Hit Location"],
	},
	{
		name: "Groin",
		modifier: -3,
		tags: ["Hit Location"],
	},
	{
		name: "Left Arm",
		modifier: -2,
		tags: ["Hit Location"],
	},
	{
		name: "Left Leg",
		modifier: -2,
		tags: ["Hit Location"],
	},
	{
		name: "Hand",
		modifier: -4,
		tags: ["Hit Location"],
	},
	{
		name: "Foot",
		modifier: -4,
		tags: ["Hit Location"],
	},
	{
		name: "Neck",
		modifier: -5,
		tags: ["Hit Location"],
	},
	{
		name: "Vitals",
		modifier: -3,
		tags: ["Hit Location"],
	},
	{
		name: "Shooting through light cover",
		modifier: -2,
		tags: ["Ranged Combat"],
	},
	{
		name: "Target behind someone else (per intervening figure)",
		modifier: -4,
		tags: ["Ranged Combat"],
	},
	{
		name: "Target crouching, kneeling, sitting, or lying down",
		modifier: -2,
		tags: ["Ranged Combat"],
	},
	{
		name: "Target only partly exposed",
		modifier: -2,
		tags: ["Ranged Combat"],
	},
	{
		name: "Laser sight",
		modifier: +1,
		tags: ["Ranged Combat"],
	},
	{
		name: "Scope (per second of Aim, Max: Scope Acc)",
		modifier: +1,
		tags: ["Ranged Combat"],
	},
	{
		name: "Unfamiliar weapon or targeting system",
		modifier: -2,
		tags: ["Ranged Combat"],
	},
];

export type ImagePath = `${string}.${ImageFileExtension}`;
type ImageFileExtension = "jpg" | "jpeg" | "png" | "svg" | "webp";

export enum UserFlags {
	Init = "init",
	ModifierStack = "modifierStack",
	ModifierTotal = "modifierTotal",
	ModifierSticky = "modifierSticky",
	ModifierPinned = "pinnedMods",
}
