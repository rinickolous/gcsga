import { EquipmentModifierGURPS } from "@item";
import { ContainerGURPS } from "@item/container";
import { EquipmentData } from "./data";

export class EquipmentGURPS extends ContainerGURPS {
	unsatisfied_reason = "";

	static override get schema(): typeof EquipmentData {
		return EquipmentData;
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

export interface EquipmentGURPS {
	readonly data: EquipmentData;
}
