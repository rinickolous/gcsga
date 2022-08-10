import { BaseItemGURPS } from "@item/base";
import { EquipmentCostType, EquipmentModifierData, EquipmentWeightType } from "./data";

export class EquipmentModifierGURPS extends BaseItemGURPS {
	// static get schema(): typeof EquipmentModifierData {
	// 	return EquipmentModifierData;
	// }

	get enabled(): boolean {
		return !this.system.disabled;
	}

	// get features() {
	// 	return this.system.features;
	// }

	get costType(): EquipmentCostType {
		return this.system.cost_type;
	}

	get costAmount(): string {
		return this.system.cost;
	}

	get weightType(): EquipmentWeightType {
		return this.system.weight_type;
	}

	get weightAmount(): string {
		return this.system.weight;
	}
}

export interface EquipmentModifierGURPS {
	readonly system: EquipmentModifierData;
}
