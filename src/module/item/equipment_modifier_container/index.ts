import { ContainerGURPS } from "@item/container";
import { EquipmentModifierGURPS } from "@item/equipment_modifier";
import { TechniqueGURPS } from "@item/technique";
import { EquipmentModifierContainerData } from "./data";

export class EquipmentModifierContainerGURPS extends ContainerGURPS {
	// static override get schema(): typeof EquipmentModifierContainerData {
	// 	return EquipmentModifierContainerData;
	// }

	// Embedded Items
	get children(): Collection<
		| EquipmentModifierGURPS
		| TechniqueGURPS
		| EquipmentModifierContainerGURPS
	> {
		const children: Collection<
			| EquipmentModifierGURPS
			| TechniqueGURPS
			| EquipmentModifierContainerGURPS
		> = new Collection();
		this.items.forEach(item => {
			if (
				item instanceof EquipmentModifierGURPS ||
				item instanceof TechniqueGURPS ||
				item instanceof EquipmentModifierContainerGURPS
			)
				children.set(item.id!, item);
		});
		return children;
	}
}

export interface EquipmentModifierContainerGURPS {
	readonly system: EquipmentModifierContainerData;
}
