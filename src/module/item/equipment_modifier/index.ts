import { ItemGURPS } from "@item/base";
import { EquipmentCostType, EquipmentModifierData, EquipmentWeightType } from "./data";

//@ts-ignore
export class EquipmentModifierGURPS extends ItemGURPS {
	static get schema(): typeof EquipmentModifierData {
		return EquipmentModifierData;
	}

	get cost_type(): EquipmentCostType {
		return this.data.data.cost_type;
	}

	get cost_amount(): string {
		return this.data.data.cost;
	}

	get weight_type(): EquipmentWeightType {
		return this.data.data.weight_type;
	}

	get weight_amount(): string {
		return this.data.data.weight;
	}
}

export interface EquipmentModifierGURPS {
	readonly data: EquipmentModifierData;
}
