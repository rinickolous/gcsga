import { ItemGURPS } from "@item/base";
import { EquipmentModifierData } from "./data";

//@ts-ignore
export class EquipmentModifierGURPS extends ItemGURPS {
	static get schema(): typeof EquipmentModifierData {
		return EquipmentModifierData;
	}
}

export interface EquipmentModifierGURPS {
	readonly data: EquipmentModifierData;
}
