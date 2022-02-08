export const CHARACTER_DEFAULTS: Record<string, unknown> = {};

CHARACTER_DEFAULTS["data.settings.attributes"] = {
	st: {
		id: "st",
		type: "integer",
		name: "ST",
		full_name: "Strength",
		attribute_base: "10",
		cost_per_point: 10,
		cost_adj_percent_per_sm: 10,
	},
	dx: {
		id: "dx",
		type: "integer",
		name: "DX",
		full_name: "Dexterity",
		attribute_base: "10",
		cost_per_point: 20,
		cost_adj_percent_per_sm: 0,
	},
	iq: {
		id: "iq",
		type: "integer",
		name: "IQ",
		full_name: "Intelligence",
		attribute_base: "10",
		cost_per_point: 20,
		cost_adj_percent_per_sm: 0,
	},
	ht: {
		id: "ht",
		type: "integer",
		name: "HT",
		full_name: "Health",
		attribute_base: "10",
		cost_per_point: 10,
		cost_adj_percent_per_sm: 0,
	},
	will: {
		id: "will",
		type: "integer",
		name: "Will",
		full_name: "",
		attribute_base: "$iq",
		cost_per_point: 5,
		cost_adj_percent_per_sm: 0,
	},
	fright_check: {
		id: "fright_check",
		type: "integer",
		name: "Fright Check",
		full_name: "",
		attribute_base: "$will",
		cost_per_point: 2,
		cost_adj_percent_per_sm: 0,
	},
	per: {
		id: "per",
		type: "integer",
		name: "Per",
		full_name: "Perception",
		attribute_base: "$iq",
		cost_per_point: 5,
		cost_adj_percent_per_sm: 0,
	},
	vision: {
		id: "vision",
		type: "integer",
		name: "Vision",
		full_name: "",
		attribute_base: "$per",
		cost_per_point: 2,
		cost_adj_percent_per_sm: 0,
	},
	hearing: {
		id: "hearing",
		type: "integer",
		name: "Hearing",
		full_name: "",
		attribute_base: "$per",
		cost_per_point: 2,
		cost_adj_percent_per_sm: 0,
	},
	taste_smell: {
		id: "taste_smell",
		type: "integer",
		name: "Taste & Smell",
		full_name: "",
		attribute_base: "$per",
		cost_per_point: 2,
		cost_adj_percent_per_sm: 0,
	},
	touch: {
		id: "touch",
		type: "integer",
		name: "Touch",
		full_name: "",
		attribute_base: "$per",
		cost_per_point: 2,
		cost_adj_percent_per_sm: 0,
	},
	basic_speed: {
		id: "basic_speed",
		type: "decimal",
		name: "Basic Speed",
		full_name: "",
		attribute_base: "($dx+$ht)/4",
		cost_per_point: 20,
		cost_adj_percent_per_sm: 0,
	},
	basic_move: {
		id: "basic_move",
		type: "integer",
		name: "Basic Move",
		full_name: "",
		attribute_base: "floor($basic_speed)",
		cost_per_point: 5,
		cost_adj_percent_per_sm: 0,
	},
	fp: {
		id: "fp",
		type: "pool",
		name: "FP",
		full_name: "Fatigue Points",
		attribute_base: "$ht",
		cost_per_point: 3,
		cost_adj_percent_per_sm: 0,
		thresholds: {
			"0": {
				state: "Unconscious",
				explanation: "",
				multiplier: -1,
				divisor: 1,
				addition: 0,
				ops: ["halve_move", "halve_dodge", "halve_st"],
			},
			"1": {
				state: "Collapse",
				explanation:
					"<html><body>\n<b>Roll vs. Will</b> to do anything besides talk or rest; failure causes unconsciousness<br>\nEach FP you lose below 0 also causes 1 HP of injury<br>\nMove, Dodge and ST are halved (B426)\n</body></html>",
				multiplier: 0,
				divisor: 1,
				addition: 0,
				ops: ["halve_move", "halve_dodge", "halve_st"],
			},
			"2": {
				state: "Tired",
				explanation: "Move, Dodge and ST are halved (B426)",
				multiplier: 1,
				divisor: 3,
				addition: 0,
				ops: ["halve_move", "halve_dodge", "halve_st"],
			},
			"3": {
				state: "Tiring",
				explanation: "",
				multiplier: 1,
				divisor: 1,
				addition: -1,
				ops: [],
			},
			"4": {
				state: "Rested",
				explanation: "",
				multiplier: 1,
				divisor: 1,
				addition: 0,
				ops: [],
			},
		},
	},
	hp: {
		id: "hp",
		type: "pool",
		name: "HP",
		full_name: "Hit Points",
		attribute_base: "$st",
		cost_per_point: 2,
		cost_adj_percent_per_sm: 10,
		thresholds: {
			"0": {
				state: "Dead",
				explanation: "",
				multiplier: -5,
				divisor: 1,
				addition: 0,
				ops: ["halve_move", "halve_dodge"],
			},
			"1": {
				state: "Dying #4",
				explanation:
					"<html><body>\n<b>Roll vs. HT</b> to avoid death<br>\n<b>Roll vs. HT-4</b> every second to avoid falling unconscious<br>\nMove and Dodge are halved (B419)\n</body></html>",
				multiplier: -4,
				divisor: 1,
				addition: 0,
				ops: ["halve_move", "halve_dodge"],
			},
			"2": {
				state: "Dying #3",
				explanation:
					"<html><body>\n<b>Roll vs. HT</b> to avoid death<br>\n<b>Roll vs. HT-3</b> every second to avoid falling unconscious<br>\nMove and Dodge are halved (B419)\n</body></html>",
				multiplier: -3,
				divisor: 1,
				addition: 0,
				ops: ["halve_move", "halve_dodge"],
			},
			"3": {
				state: "Dying #2",
				explanation:
					"<html><body>\n<b>Roll vs. HT</b> to avoid death<br>\n<b>Roll vs. HT-2</b> every second to avoid falling unconscious<br>\nMove and Dodge are halved (B419)\n</body></html>",
				multiplier: -2,
				divisor: 1,
				addition: 0,
				ops: ["halve_move", "halve_dodge"],
			},
			"4": {
				state: "Dying #1",
				explanation:
					"<html><body>\n<b>Roll vs. HT</b> to avoid death<br>\n<b>Roll vs. HT-1</b> every second to avoid falling unconscious<br>\nMove and Dodge are halved (B419)\n</body></html>",
				multiplier: -1,
				divisor: 1,
				addition: 0,
				ops: ["halve_move", "halve_dodge"],
			},
			"5": {
				state: "Collapse",
				explanation:
					"<html><body>\n<b>Roll vs. HT</b> every second to avoid falling unconscious<br>\nMove and Dodge are halved (B419)\n</body></html>",
				multiplier: 0,
				divisor: 1,
				addition: 0,
				ops: ["halve_move", "halve_dodge"],
			},
			"6": {
				state: "Reeling",
				explanation: "Move and Dodge are halved (B419)",
				multiplier: 1,
				divisor: 3,
				addition: 0,
				ops: ["halve_move", "halve_dodge"],
			},
			"7": {
				state: "Wounded",
				explanation: "",
				multiplier: 1,
				divisor: 1,
				addition: -1,
				ops: {},
			},
			"8": {
				state: "Healthy",
				explanation: "",
				multiplier: 1,
				divisor: 1,
				addition: 0,
				ops: {},
			},
		},
	},
};
CHARACTER_DEFAULTS["data.settings.hit_locations"] = {
	id: "humanoid",
	name: "Humanoid",
	roll: "3d",
	locations: {
		"0": {
			id: "eye",
			choice_name: "Eyes",
			table_name: "Eyes",
			slots: 0,
			hit_penalty: -9,
			dr_bonus: 0,
			description:
				"An attack that misses by 1 hits the torso instead. Only impaling (imp), piercing (pi-, pi, pi+, pi++), and tight-beam burning (burn) attacks can target the eye – and only from the front or sides. Injury over HP÷10 blinds the eye. Otherwise, treat as skull, but without the extra DR!",
			calc: {
				roll_range: "-",
				dr: {
					all: 0,
				},
			},
		},
		"1": {
			id: "skull",
			choice_name: "Skull",
			table_name: "Skull",
			slots: 2,
			hit_penalty: -7,
			dr_bonus: 2,
			description:
				"An attack that misses by 1 hits the torso instead. Wounding modifier is x4. Knockdown rolls are at -10. Critical hits use the Critical Head Blow Table (B556). Exception: These special effects do not apply to toxic (tox) damage.",
			calc: {
				roll_range: "3-4",
				dr: {
					all: 2,
				},
			},
		},
		"2": {
			id: "face",
			choice_name: "Face",
			table_name: "Face",
			slots: 1,
			hit_penalty: -5,
			dr_bonus: 0,
			description:
				"An attack that misses by 1 hits the torso instead. Jaw, cheeks, nose, ears, etc. If the target has an open-faced helmet, ignore its DR. Knockdown rolls are at -5. Critical hits use the Critical Head Blow Table (B556). Corrosion (cor) damage gets a x1½ wounding modifier, and if it inflicts a major wound, it also blinds one eye (both eyes on damage over full HP). Random attacks from behind hit the skull instead.",
			calc: {
				roll_range: "5",
				dr: {
					all: 0,
				},
			},
		},
		"3": {
			id: "leg",
			choice_name: "Leg",
			table_name: "Right Leg",
			slots: 2,
			hit_penalty: -2,
			dr_bonus: 0,
			description:
				"Reduce the wounding multiplier of large piercing (pi+), huge piercing (pi++), and impaling (imp) damage to x1. Any major wound (loss of over ½ HP from one blow) cripples the limb. Damage beyond that threshold is lost.",
			calc: {
				roll_range: "6-7",
				dr: {
					all: 0,
				},
			},
		},
		"4": {
			id: "arm",
			choice_name: "Arm",
			table_name: "Right Arm",
			slots: 1,
			hit_penalty: -2,
			dr_bonus: 0,
			description:
				"Reduce the wounding multiplier of large piercing (pi+), huge piercing (pi++), and impaling (imp) damage to x1. Any major wound (loss of over ½ HP from one blow) cripples the limb. Damage beyond that threshold is lost. If holding a shield, double the penalty to hit: -4 for shield arm instead of -2.",
			calc: {
				roll_range: "8",
				dr: {
					all: 0,
				},
			},
		},
		"5": {
			id: "torso",
			choice_name: "Torso",
			table_name: "Torso",
			slots: 2,
			hit_penalty: 0,
			dr_bonus: 0,
			description: "",
			calc: {
				roll_range: "9-10",
				dr: {
					all: 0,
				},
			},
		},
		"6": {
			id: "groin",
			choice_name: "Groin",
			table_name: "Groin",
			slots: 1,
			hit_penalty: -3,
			dr_bonus: 0,
			description:
				"An attack that misses by 1 hits the torso instead. Human males and the males of similar species suffer double shock from crushing (cr) damage, and get -5 to knockdown rolls. Otherwise, treat as a torso hit.",
			calc: {
				roll_range: "11",
				dr: {
					all: 0,
				},
			},
		},
		"7": {
			id: "arm",
			choice_name: "Arm",
			table_name: "Left Arm",
			slots: 1,
			hit_penalty: -2,
			dr_bonus: 0,
			description:
				"Reduce the wounding multiplier of large piercing (pi+), huge piercing (pi++), and impaling (imp) damage to x1. Any major wound (loss of over ½ HP from one blow) cripples the limb. Damage beyond that threshold is lost. If holding a shield, double the penalty to hit: -4 for shield arm instead of -2.",
			calc: {
				roll_range: "12",
				dr: {
					all: 0,
				},
			},
		},
		"8": {
			id: "leg",
			choice_name: "Leg",
			table_name: "Left Leg",
			slots: 2,
			hit_penalty: -2,
			dr_bonus: 0,
			description:
				"Reduce the wounding multiplier of large piercing (pi+), huge piercing (pi++), and impaling (imp) damage to x1. Any major wound (loss of over ½ HP from one blow) cripples the limb. Damage beyond that threshold is lost.",
			calc: {
				roll_range: "13-14",
				dr: {
					all: 0,
				},
			},
		},
		"9": {
			id: "hand",
			choice_name: "Hand",
			table_name: "Hand",
			slots: 1,
			hit_penalty: -4,
			dr_bonus: 0,
			description:
				"If holding a shield, double the penalty to hit: -8 for shield hand instead of -4. Reduce the wounding multiplier of large piercing (pi+), huge piercing (pi++), and impaling (imp) damage to x1. Any major wound (loss of over ⅓ HP from one blow) cripples the extremity. Damage beyond that threshold is lost.",
			calc: {
				roll_range: "15",
				dr: {
					all: 0,
				},
			},
		},
		"10": {
			id: "foot",
			choice_name: "Foot",
			table_name: "Foot",
			slots: 1,
			hit_penalty: -4,
			dr_bonus: 0,
			description:
				"Reduce the wounding multiplier of large piercing (pi+), huge piercing (pi++), and impaling (imp) damage to x1. Any major wound (loss of over ⅓ HP from one blow) cripples the extremity. Damage beyond that threshold is lost.",
			calc: {
				roll_range: "16",
				dr: {
					all: 0,
				},
			},
		},
		"11": {
			id: "neck",
			choice_name: "Neck",
			table_name: "Neck",
			slots: 2,
			hit_penalty: -5,
			dr_bonus: 0,
			description:
				"An attack that misses by 1 hits the torso instead. Neck and throat. Increase the wounding multiplier of crushing (cr) and corrosion (cor) attacks to x1½, and that of cutting (cut) damage to x2. At the GM’s option, anyone killed by a cutting (cut) blow to the neck is decapitated!",
			calc: {
				roll_range: "17-18",
				dr: {
					all: 0,
				},
			},
		},
		"12": {
			id: "vitals",
			choice_name: "Vitals",
			table_name: "Vitals",
			slots: 0,
			hit_penalty: -3,
			dr_bonus: 0,
			description:
				"An attack that misses by 1 hits the torso instead. Heart, lungs, kidneys, etc. Increase the wounding modifier for an impaling (imp) or any piercing (pi-, pi, pi+, pi++) attack to x3. Increase the wounding modifier for a tight-beam burning (burn) attack to x2. Other attacks cannot target the vitals.",
			calc: {
				roll_range: "-",
				dr: {
					all: 0,
				},
			},
		},
	},
};
CHARACTER_DEFAULTS["data.attributes"] = {
	st: {
		attr_id: "st",
		adj: 0,
		calc: {
			value: 10,
			points: 0,
		},
	},
	dx: {
		attr_id: "dx",
		adj: 0,
		calc: {
			value: 10,
			points: 0,
		},
	},
	iq: {
		attr_id: "iq",
		adj: 0,
		calc: {
			value: 10,
			points: 0,
		},
	},
	ht: {
		attr_id: "ht",
		adj: 0,
		calc: {
			value: 10,
			points: 0,
		},
	},
	will: {
		attr_id: "will",
		adj: 0,
		calc: {
			value: 10,
			points: 0,
		},
	},
	fright_check: {
		attr_id: "fright_check",
		adj: 0,
		calc: {
			value: 10,
			points: 0,
		},
	},
	per: {
		attr_id: "per",
		adj: 0,
		calc: {
			value: 10,
			points: 0,
		},
	},
	vision: {
		attr_id: "vision",
		adj: 0,
		calc: {
			value: 10,
			points: 0,
		},
	},
	hearing: {
		attr_id: "hearing",
		adj: 0,
		calc: {
			value: 10,
			points: 0,
		},
	},
	taste_smell: {
		attr_id: "taste_smell",
		adj: 0,
		calc: {
			value: 10,
			points: 0,
		},
	},
	touch: {
		attr_id: "touch",
		adj: 0,
		calc: {
			value: 10,
			points: 0,
		},
	},
	basic_speed: {
		attr_id: "basic_speed",
		adj: 0,
		calc: {
			value: 5,
			points: 0,
		},
	},
	basic_move: {
		attr_id: "basic_move",
		adj: 0,
		calc: {
			value: 5,
			points: 0,
		},
	},
	fp: {
		attr_id: "fp",
		adj: 0,
		damage: 0,
		calc: {
			value: 10,
			current: 10,
			points: 0,
		},
	},
	hp: {
		attr_id: "hp",
		adj: 0,
		damage: 0,
		calc: {
			value: 10,
			current: 10,
			points: 0,
		},
	},
};
