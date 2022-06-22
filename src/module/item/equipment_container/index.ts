import { ContainerGURPS } from "@item/container";
import { EquipmentContainerData } from "./data";

//@ts-ignore
export class EquipmentContainerGURPS extends ContainerGURPS {
	static override get schema(): typeof EquipmentContainerData {
		return EquipmentContainerData;
	}

	get enabled(): boolean {
		if (!this.data.data.equipped || this.data.data.other) return false;
		return true;
	}
	set enabled(enabled: boolean) {
		this.data.data.equipped = enabled;
	}

	get equipped(): boolean {
		return this.enabled;
	}
	set equipped(enabled: boolean) {
		this.data.data.equipped = enabled;
	}
}

export interface EquipmentContainerGURPS {
	readonly data: EquipmentContainerData;
}
