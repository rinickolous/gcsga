import { ItemType } from "@item/data"
import { ItemGCSSource, ItemGCSSystemData } from "@item/gcs"
import { Feature } from "@module/config"

export type EquipmentModifierSource = ItemGCSSource<ItemType.EquipmentModifier, EquipmentModifierSystemData>

// Export class EquipmentModifierData extends BaseItemDataGURPS<EquipmentModifierGURPS> {}

export interface EquipmentModifierData extends Omit<EquipmentModifierSource, "effects">, EquipmentModifierSystemData {
	readonly type: EquipmentModifierSource["type"]
	data: EquipmentModifierSystemData

	readonly _source: EquipmentModifierSource
}

export interface EquipmentModifierSystemData extends ItemGCSSystemData {
	cost_type: EquipmentCostType
	cost: string
	weight_type: EquipmentWeightType
	weight: string
	tech_level: string
	features: Feature[]
	disabled: boolean
}

export type EquipmentCostType = "to_original_cost" | "to_base_cost" | "to_final_base_cost" | "to_final_cost"
export type EquipmentWeightType = "to_original_weight" | "to_base_weight" | "to_final_base_weight" | "to_final_weight"
