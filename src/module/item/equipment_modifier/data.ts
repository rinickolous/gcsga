import { BaseItemDataGURPS, BaseItemSourceGURPS, ItemSystemData } from "@item/base/data";
import { Feature } from "@module/feature";
import { EquipmentModifierGURPS } from ".";

export type EquipmentModifierSource = BaseItemSourceGURPS<"eqp_modifier", EquipmentModifierSystemData>;

export class EquipmentModifierData extends BaseItemDataGURPS<EquipmentModifierGURPS> {}

export interface EquipmentModifierData extends Omit<EquipmentModifierSource, "effects" | "flags"> {
	readonly type: EquipmentModifierSource["type"];
	data: EquipmentModifierSystemData;

	readonly _source: EquipmentModifierSource;
}

export interface EquipmentModifierSystemData extends ItemSystemData {
	cost_type: EquipmentCostType;
	cost: string;
	weight_type: EquipmentWeightType;
	weight: string;
	tech_level: string;
	features: Feature[];
}

export type EquipmentCostType = "to_original_cost" | "to_base_cost" | "to_final_base_cost" | "to_final_cost";
export type EquipmentWeightType = "to_original_weight" | "to_base_weight" | "to_final_base_weight" | "to_final_weight";
