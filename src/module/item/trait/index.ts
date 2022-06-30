import { ContainerGURPS, TraitContainerGURPS, TraitModifierGURPS } from "@item";
import { CRAdjustment } from "@module/data";
import { TraitData } from "./data";

export class TraitGURPS extends ContainerGURPS {
	static override get schema(): typeof TraitData {
		return TraitData;
	}

	// Getters
	get enabled(): boolean {
		if (this.data.data.disabled) return false;
		let enabled = !this.data.data.disabled;
		if (this.parent && this.parent instanceof TraitContainerGURPS) enabled = enabled && this.parent.enabled;
		return enabled;
	}
	set enabled(enabled: boolean) {
		this.data.data.disabled = !enabled;
	}

	get levels(): number {
		return this.data.data.levels;
	}

	get cr(): CR {
		return this.data.data.cr;
	}

	get cr_adj(): CRAdjustment {
		return this.data.data.cr_adj;
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

export interface TraitGURPS {
	readonly data: TraitData;
}
