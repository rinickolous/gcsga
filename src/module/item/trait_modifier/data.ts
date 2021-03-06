import { Feature } from "@feature";
import { BaseItemDataGURPS, BaseItemSourceGURPS, ItemSystemData } from "@item/base/data";
import { TraitModifierGURPS } from ".";

export type TraitModifierSource = BaseItemSourceGURPS<"modifier", TraitModifierSystemData>;

export class TraitModifierData extends BaseItemDataGURPS<TraitModifierGURPS> {}

export interface TraitModifierData extends Omit<TraitModifierSource, "effects" | "flags"> {
	readonly type: TraitModifierSource["type"];
	data: TraitModifierSystemData;

	readonly _source: TraitModifierSource;
}

export interface TraitModifierSystemData extends ItemSystemData {
	disabled: boolean;
	cost_type: TraitModifierCostType;
	cost: number;
	levels: number;
	affects: TraitModifierAffects;
	features: Feature[];
}

export type TraitModifierCostType = "percentage" | "points" | "multiplier";
export type TraitModifierAffects = "total" | "base_only" | "levels_only";
