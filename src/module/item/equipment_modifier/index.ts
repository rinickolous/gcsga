import { ItemGURPS } from "@item/base";
import { EquipmentCostType, EquipmentModifierData } from "./data";

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
}

export interface EquipmentModifierGURPS {
	readonly data: EquipmentModifierData;
}
