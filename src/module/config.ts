import { CharacterGURPS } from "@actor";
import {
	TraitGURPS,
	TraitContainerGURPS,
	SkillGURPS,
	TechniqueGURPS,
	SkillContainerGURPS,
	SpellGURPS,
	RitualMagicSpellGURPS,
	SpellContainerGURPS,
	EquipmentGURPS,
	EquipmentModifierGURPS,
	EquipmentContainerGURPS,
	NoteGURPS,
	NoteContainerGURPS,
	TraitModifierGURPS,
} from "@item";

export const GURPSCONFIG = {
	SYSTEM_NAME: "gcsga",
	portrait_path: "images/portraits/",
	Item: {
		documentClasses: {
			trait: TraitGURPS,
			trait_container: TraitContainerGURPS,
			modifier: TraitModifierGURPS,
			skill: SkillGURPS,
			technique: TechniqueGURPS,
			skill_container: SkillContainerGURPS,
			spell: SpellGURPS,
			ritual_magic_spell: RitualMagicSpellGURPS,
			spell_container: SpellContainerGURPS,
			equipment: EquipmentGURPS,
			eqp_modifier: EquipmentModifierGURPS,
			equipment_container: EquipmentContainerGURPS,
			note: NoteGURPS,
			note_container: NoteContainerGURPS,
		},
		containerContents: {
			trait: ["modifier"],
			trait_container: ["trait", "trait_container", "modifier"],
			skill_container: ["skill", "technique", "skill_container"],
			spell_container: ["spell", "ritual_magic_spell", "spell_container"],
			equipment: ["eqp_modifier"],
			equipment_container: ["equipment", "eqp_modifier", "equipment_container"],
			note_container: ["note", "note_container"],
		},
	},
	Actor: {
		documentClasses: {
			character: CharacterGURPS,
		},
		weightUnits: {
			oz: {
				label: "oz",
				multiplier: 0.45359237 / 16,
				multiplier_simple: 0.03,
			},
			lb: {
				label: "lb",
				multiplier: 0.45359237,
				multiplier_simple: 0.5,
			},
			tn: {
				label: "tn",
				multiplier: 0.45359237 * 2000,
				multiplier_simple: 1000,
			},
			lt: {
				label: "lt",
				multiplier: 0.45359237 * 2240,
				multiplier_simple: 1120,
			},
			t: {
				label: "t",
				multiplier: 1000,
				multiplier_simple: 1120,
			},
			kg: {
				label: "kg",
				multiplier: 1,
				multiplier_simple: 1,
			},
			g: {
				label: "g",
				multiplier: 0.001,
				multiplier_simple: 0.001,
			},
		},
	},
	defaults: {
		actor: {
			settings: {
				attributes: {
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
					},
					iq: {
						id: "iq",
						type: "integer",
						name: "IQ",
						full_name: "Intelligence",
						attribute_base: "10",
						cost_per_point: 20,
					},
					ht: {
						id: "ht",
						type: "integer",
						name: "HT",
						full_name: "Health",
						attribute_base: "10",
						cost_per_point: 10,
					},
					will: {
						id: "will",
						type: "integer",
						name: "Will",
						attribute_base: "$iq",
						cost_per_point: 5,
					},
					fright_check: {
						id: "fright_check",
						type: "integer",
						name: "Fright Check",
						attribute_base: "$will",
						cost_per_point: 2,
					},
					per: {
						id: "per",
						type: "integer",
						name: "Per",
						full_name: "Perception",
						attribute_base: "$iq",
						cost_per_point: 5,
					},
					vision: {
						id: "vision",
						type: "integer",
						name: "Vision",
						attribute_base: "$per",
						cost_per_point: 2,
					},
					hearing: {
						id: "hearing",
						type: "integer",
						name: "Hearing",
						attribute_base: "$per",
						cost_per_point: 2,
					},
					taste_smell: {
						id: "taste_smell",
						type: "integer",
						name: "Taste \u0026 Smell",
						attribute_base: "$per",
						cost_per_point: 2,
					},
					touch: {
						id: "touch",
						type: "integer",
						name: "Touch",
						attribute_base: "$per",
						cost_per_point: 2,
					},
					basic_speed: {
						id: "basic_speed",
						type: "decimal",
						name: "Basic Speed",
						attribute_base: "($dx+$ht)/4",
						cost_per_point: 20,
					},
					basic_move: {
						id: "basic_move",
						type: "integer",
						name: "Basic Move",
						attribute_base: "floor($basic_speed)",
						cost_per_point: 5,
					},
					fp: {
						id: "fp",
						type: "pool",
						name: "FP",
						full_name: "Fatigue Points",
						attribute_base: "$ht",
						cost_per_point: 3,
						thresholds: [
							{
								state: "Unconscious",
								multiplier: -1,
								divisor: 1,
								ops: ["halve_move", "halve_dodge", "halve_st"],
							},
							{
								state: "Collapse",
								explanation:
									"Roll vs. Will to do anything besides talk or rest; failure causes unconsciousness\nEach FP you lose below 0 also causes 1 HP of injury\nMove, Dodge and ST are halved (B426)",
								multiplier: 0,
								divisor: 1,
								ops: ["halve_move", "halve_dodge", "halve_st"],
							},
							{
								state: "Tired",
								explanation: "Move, Dodge and ST are halved (B426)",
								multiplier: 1,
								divisor: 3,
								ops: ["halve_move", "halve_dodge", "halve_st"],
							},
							{
								state: "Tiring",
								multiplier: 1,
								divisor: 1,
								addition: -1,
							},
							{
								state: "Rested",
								multiplier: 1,
								divisor: 1,
							},
						],
					},
					hp: {
						id: "hp",
						type: "pool",
						name: "HP",
						full_name: "Hit Points",
						attribute_base: "$st",
						cost_per_point: 2,
						cost_adj_percent_per_sm: 10,
						thresholds: [
							{
								state: "Dead",
								multiplier: -5,
								divisor: 1,
								ops: ["halve_move", "halve_dodge"],
							},
							{
								state: "Dying #4",
								explanation:
									"Roll vs. HT to avoid death\nRoll vs. HT-4 every second to avoid falling unconscious\nMove and Dodge are halved (B419)",
								multiplier: -4,
								divisor: 1,
								ops: ["halve_move", "halve_dodge"],
							},
							{
								state: "Dying #3",
								explanation:
									"Roll vs. HT to avoid death\nRoll vs. HT-3 every second to avoid falling unconscious\nMove and Dodge are halved (B419)",
								multiplier: -3,
								divisor: 1,
								ops: ["halve_move", "halve_dodge"],
							},
							{
								state: "Dying #2",
								explanation:
									"Roll vs. HT to avoid death\nRoll vs. HT-2 every second to avoid falling unconscious\nMove and Dodge are halved (B419)",
								multiplier: -2,
								divisor: 1,
								ops: ["halve_move", "halve_dodge"],
							},
							{
								state: "Dying #1",
								explanation:
									"Roll vs. HT to avoid death\nRoll vs. HT-1 every second to avoid falling unconscious\nMove and Dodge are halved (B419)",
								multiplier: -1,
								divisor: 1,
								ops: ["halve_move", "halve_dodge"],
							},
							{
								state: "Collapse",
								explanation:
									"Roll vs. HT every second to avoid falling unconscious\nMove and Dodge are halved (B419)",
								multiplier: 0,
								divisor: 1,
								ops: ["halve_move", "halve_dodge"],
							},
							{
								state: "Reeling",
								explanation: "Move and Dodge are halved (B419)",
								multiplier: 1,
								divisor: 3,
								ops: ["halve_move", "halve_dodge"],
							},
							{
								state: "Wounded",
								multiplier: 1,
								divisor: 1,
								addition: -1,
							},
							{
								state: "Healthy",
								multiplier: 1,
								divisor: 1,
							},
						],
					},
				},
				hit_locations: {
					name: "Humanoid",
					roll: "3d",
					locations: [
						{
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
						{
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
						{
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
						{
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
						{
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
						{
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
						{
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
						{
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
						{
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
						{
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
						{
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
						{
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
						{
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
					],
				},
			},
			attributes: {
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
					calc: {
						value: 10,
						current: 10,
						points: 0,
					},
				},
				hp: {
					attr_id: "hp",
					adj: 0,
					calc: {
						value: 10,
						current: 10,
						points: 0,
					},
				},
			},
		},
	},
};
