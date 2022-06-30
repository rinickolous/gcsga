import { EquipmentGURPS, EquipmentModifierGURPS } from "@item";
import { ContainerGURPS } from "@item/container";
import { EquipmentContainerData } from "./data";

export class EquipmentContainerGURPS extends ContainerGURPS {
	static override get schema(): typeof EquipmentContainerData {
		return EquipmentContainerData;
	}

	// Getters
	get other(): boolean {
		return this.data.data.other;
	}

	get features() {
		return this.data.data.features;
	}

	get prereqs() {
		return this.data.data.prereqs;
	}

	get prereqsEmpty(): boolean {
		return this.prereqs.prereqs.length == 0;
	}

	// Embedded Items
	get children(): Collection<EquipmentGURPS | EquipmentContainerGURPS> {
		//@ts-ignore
		return new Collection(
			this.deepItems
				.filter((item) => item instanceof EquipmentGURPS || item instanceof EquipmentContainerGURPS)
				.map((item) => {
					return [item.data._id, item];
				}),
		);
	}
	get modifiers(): Collection<EquipmentModifierGURPS> {
		//@ts-ignore
		return new Collection(
			this.deepItems
				.filter((item) => item instanceof EquipmentModifierGURPS)
				.map((item) => {
					return [item.data._id, item];
				}),
		);
	}
}

export interface EquipmentContainerGURPS {
	readonly data: EquipmentContainerData;
}
