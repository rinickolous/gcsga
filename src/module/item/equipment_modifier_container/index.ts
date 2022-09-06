import { ContainerGURPS } from "@item/container";
import { EquipmentModifierGURPS } from "@item/equipment_modifier";
import { EquipmentModifierContainerData } from "./data";

export class EquipmentModifierContainerGURPS extends ContainerGURPS {
	// static override get schema(): typeof EquipmentModifierContainerData {
	// 	return EquipmentModifierContainerData;
	// }

	// Embedded Items
	get children(): Collection<EquipmentModifierGURPS | EquipmentModifierContainerGURPS> {
		return super.children as Collection<EquipmentModifierGURPS | EquipmentModifierContainerGURPS>;
	}
}

export interface EquipmentModifierContainerGURPS {
	readonly system: EquipmentModifierContainerData;
}
