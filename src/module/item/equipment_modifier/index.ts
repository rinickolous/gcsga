import { BaseItemGURPS } from "@item/base";
import { EquipmentModifierData } from "./data";

export class EquipmentModifierGURPS extends BaseItemGURPS {
	static get schema(): typeof EquipmentModifierData {
		return EquipmentModifierData;
	}

	get features() {
		return this.data.data.features;
	}
}

export interface EquipmentModifierGURPS {
	readonly data: EquipmentModifierData;
}
