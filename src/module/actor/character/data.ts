import { ActorFlagsGURPS, ActorSystemData, BaseActorDataGURPS, BaseActorSourceGURPS } from "@actor/base/data";
import { TraitSystemData } from "@item/trait/data";
import { TraitContainerSystemData } from "@item/trait_container/data";
import { EquipmentSystemData } from "@item/equipment/data";
import { EquipmentContainerSystemData } from "@item/equipment_container/data";
import { NoteSystemData } from "@item/note/data";
import { NoteContainerSystemData } from "@item/note_container/data";
import { RitualMagicSpellSystemData } from "@item/ritual_magic_spell/data";
import { SkillSystemData } from "@item/skill/data";
import { SkillContainerSystemData } from "@item/skill_container/data";
import { SpellSystemData } from "@item/spell/data";
import { SpellContainerSystemData } from "@item/spell_container/data";
import { TechniqueSystemData } from "@item/technique/data";
import { DisplayMode, Height, LengthUnits, ObjArray, RollGURPS, RollRange, Weight, WeightUnits } from "@module/data";
import { CharacterGURPS } from ".";
import { AttributeDef, AttributeSettingDef } from "./attribute";
import { Feature } from "@module/feature";

export interface CharacterSource extends BaseActorSourceGURPS<"character", CharacterSystemData> {
	flags: DeepPartial<CharacterFlags>;
}

export class CharacterData extends BaseActorDataGURPS<CharacterGURPS> {
	featureStack: Feature[] = [];
}

export interface CharacterData extends Omit<CharacterSource, "effects" | "flags" | "items" | "token"> {
	readonly type: CharacterSource["type"];
	data: CharacterSystemData;
	flags: CharacterFlags;

	readonly _source: CharacterSource;
}

type CharacterFlags = ActorFlagsGURPS & {
	gcsga: {
		// empty
	};
};

export interface CharacterSystemData extends ActorSystemData {
	version: number;
	import: CharacterImportData;
	settings: CharacterSettings;
	created_date: string;
	modified_date: string;
	profile: CharacterProfile;
	attributes: Record<string, AttributeDef>;
	points: CharacterPoints;
	calc: CharacterCalc;
}

export interface ImportedData extends Omit<CharacterSystemData, "attributes" | "settings"> {
	total_points: number;
	attributes: Array<AttributeDef>;
	settings: Omit<CharacterSystemData["settings"], "attributes"> & { attributes: Array<AttributeSettingDef> };
	traits: Array<TraitContainerSystemData | TraitSystemData>;
	skills: Array<SkillContainerSystemData | SkillSystemData | TechniqueSystemData>;
	spells: Array<SpellContainerSystemData | SpellSystemData | RitualMagicSpellSystemData>;
	equipment: Array<EquipmentContainerSystemData | EquipmentSystemData>;
	other_equipment: Array<EquipmentContainerSystemData | EquipmentSystemData>;
	notes: Array<NoteContainerSystemData | NoteSystemData>;
}

export interface CharacterImportData {
	name: string;
	path: string;
	last_import: string;
}

export interface CharacterSettings {
	default_length_units: LengthUnits;
	default_weight_units: WeightUnits;
	user_description_display: DisplayMode;
	modifiers_display: DisplayMode;
	notes_display: DisplayMode;
	skill_level_adj_display: DisplayMode;
	use_multiplicative_modifiers: boolean;
	use_modifying_dice_plus_adds: boolean;
	damage_progression: DamageProgression;
	use_simple_metric_conversions: boolean;
	show_college_in_sheet_spells: boolean;
	show_difficulty: boolean;
	show_trait_modifier_adj: boolean;
	show_equipment_modifier_adj: boolean;
	show_spell_adj: boolean;
	use_title_in_footer: boolean;
	page: {
		paper_size: string;
		top_margin: string;
		left_margin: string;
		bottom_margin: string;
		right_margin: string;
		orientation: string;
	};
	block_layout: Array<string>;
	attributes: Record<string, AttributeSettingDef>;
	hit_locations: HitLocationTable;
}

export interface CharacterProfile {
	player_name: string;
	name: string;
	title: string;
	organization: string;
	age: string;
	birthday: string;
	eyes: string;
	hair: string;
	skin: string;
	handedness: string;
	height: Height;
	weight: Weight;
	SM: number;
	gender: string;
	tech_level: string;
	religion: string;
	portrait: string;
}

export interface CharacterPoints {
	total: number;
	unspent: number;
	race: number;
	attributes: number;
	advantages: number;
	disadvantages: number;
	quirks: number;
	skills: number;
	spells: number;
}

export interface CharacterCalc {
	swing: RollGURPS;
	thrust: RollGURPS;
	basic_lift: Weight;
	lifting_st_bonus: number;
	striking_st_bonus: number;
	throwing_st_bonus: number;
	move: Array<number>;
	dodge: Array<number>;
	dodge_bonus: number;
	block_bonus: number;
	parry_bonus: number;
}

export type DamageProgression =
	| "basic_set"
	| "knowing_your_own_strength"
	| "no_school_grognard_damage"
	| "thrust_equals_swing_minus_2"
	| "swing_equals_thrust_plus_2"
	| "phoenix_flame_d3";

export class HitLocationTable {
	constructor(data: HitLocationTable) {
		this.id = data.id;
		this.name = data.name;
		this.roll = data.roll;
		this.locations = this.recursiveLocations(data.locations);
	}

	recursiveLocations(locations: Array<HitLocation>) {
		const list: Array<HitLocation> = [];
		for (const i of locations) {
			const j = i;
			if (!!i.sub_table) j.sub_table = new HitLocationTable(i.sub_table);
			list.push(j);
		}
		return new ObjArray<HitLocation>(list);
	}
}

export interface HitLocationTable {
	id: string;
	name: string;
	roll: RollGURPS;
	locations: Array<HitLocation>;
}

export interface HitLocation {
	id: string;
	choice_name: string;
	table_name: string;
	slots: number;
	hit_penalty: number;
	dr_bonus: number;
	description: string;
	sub_table: HitLocationTable;
	calc: {
		roll_range: RollRange;
		dr: Record<string, number>;
	};
}
