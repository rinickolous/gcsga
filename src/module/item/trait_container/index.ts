import { ContainerGURPS, TraitGURPS, TraitModifierGURPS } from "@item";
import { CR, CRAdjustment } from "@module/data";
import { TraitContainerData } from "./data";

export class TraitContainerGURPS extends ContainerGURPS {
	static override get schema(): typeof TraitContainerData {
		return TraitContainerData;
	}

	// Getters
	get enabled(): boolean {
		if (this.data.data.disabled) return false;
		let enabled = !this.data.data.disabled;
		if (this.parent instanceof TraitContainerGURPS) enabled = enabled && this.parent.enabled;
		return enabled;
	}

	set enabled(enabled: boolean) {
		this.data.data.disabled = !enabled;
	}

	get levels(): number {
		return 0;
	}

	get cr(): CR {
		return this.data.data.cr;
	}

	get cr_adj(): CRAdjustment {
		return this.data.data.cr_adj;
	}

	// Embedded Items
	get children(): Collection<TraitGURPS | TraitContainerGURPS> {
		//@ts-ignore
		return new Collection(
			this.deepItems
				.filter((item) => item instanceof TraitGURPS || item instanceof TraitContainerGURPS)
				.map((item) => {
					return [item.data._id, item];
				}),
		);
	}
	get modifiers(): Collection<TraitModifierGURPS> {
		//@ts-ignore
		return new Collection(
			this.deepItems
				.filter((item) => item instanceof TraitModifierGURPS)
				.map((item) => {
					return [item.data._id, item];
				}),
		);
	}
}

export interface TraitContainerGURPS {
	readonly data: TraitContainerData;
}
