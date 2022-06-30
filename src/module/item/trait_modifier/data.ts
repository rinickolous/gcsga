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
	cost_type: string;
	cost: number;
	levels: number;
	affects: string;
	features: Feature[];
}
