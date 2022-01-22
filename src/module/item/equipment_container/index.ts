import { ContainerGURPS } from "@item/container";
import { EquipmentContainerData } from "./data";

//@ts-ignore
export class EquipmentContainerGURPS extends ContainerGURPS {
	static override get schema(): typeof EquipmentContainerData {
		return EquipmentContainerData;
	}
}

export interface EquipmentContainerGURPS {
	readonly data: EquipmentContainerData;
}
