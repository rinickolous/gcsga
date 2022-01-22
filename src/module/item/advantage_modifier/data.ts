import { BaseItemDataGURPS, BaseItemSourceGURPS, ItemSystemData } from "@item/base/data";
import { Feature, ObjArray } from "@module/data";
import { AdvantageModifierGURPS } from ".";

export type AdvantageModifierSource = BaseItemSourceGURPS<"modifier", AdvantageModifierSystemData>;

export class AdvantageModifierData extends BaseItemDataGURPS<AdvantageModifierGURPS> {}

export interface AdvantageModifierData extends Omit<AdvantageModifierSource, "effects" | "flags"> {
	readonly type: AdvantageModifierSource["type"];
	data: AdvantageModifierSystemData;

	readonly _source: AdvantageModifierSource;
}

export interface AdvantageModifierSystemData extends ItemSystemData {
	disabled: boolean;
	cost_type: string;
	cost: number;
	levels: number;
	affects: string;
	features: ObjArray<Feature>;
}
