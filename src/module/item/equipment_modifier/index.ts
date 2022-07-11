import { BaseItemGURPS } from "@item/base";
import { EquipmentCostType, EquipmentModifierData, EquipmentWeightType } from "./data";

export class EquipmentModifierGURPS extends BaseItemGURPS {
	static get schema(): typeof EquipmentModifierData {
		return EquipmentModifierData;
	}

	get enabled(): boolean {
		return !this.data.data.disabled;
	}

	get features() {
		return this.data.data.features;
	}

	get costType(): EquipmentCostType {
		return this.data.data.cost_type;
	}

	get costAmount(): string {
		return this.data.data.cost;
	}

	get weightType(): EquipmentWeightType {
		return this.data.data.weight_type;
	}

	get weightAmount(): string {
		return this.data.data.weight;
	}
}

export interface EquipmentModifierGURPS {
	readonly data: EquipmentModifierData;
}
