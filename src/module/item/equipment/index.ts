import { ContainerGURPS } from "@item/container";
import { EquipmentData } from "./data";

//@ts-ignore
export class EquipmentGURPS extends ContainerGURPS {
	static override get schema(): typeof EquipmentData {
		return EquipmentData;
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

export interface EquipmentGURPS {
	readonly data: EquipmentData;
}
