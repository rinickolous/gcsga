import { ContainerGURPS } from "@item/container";
import { EquipmentData } from "./data";

//@ts-ignore
export class EquipmentGURPS extends ContainerGURPS {
	static override get schema(): typeof EquipmentData {
		return EquipmentData;
	}
}

export interface EquipmentGURPS {
	readonly data: EquipmentData;
}
