import { ItemGURPS, TraitGURPS, TraitModifierGURPS } from "@item";
import { CRAdjustment } from "@module/data";
import { ContainerGURPS } from "../container";
import { TraitContainerData } from "./data";

//@ts-ignore
export class TraitContainerGURPS extends ContainerGURPS {
	static override get schema(): typeof TraitContainerData {
		return TraitContainerData;
	}

	get enabled(): boolean {
		if (this.data.data.disabled) return false;
		let enabled = !this.data.data.disabled;
		if (this.parent?.type == "trait_container") enabled = enabled && (this.parent as ItemGURPS).enabled;
		return enabled;
	}

	set enabled(enabled: boolean) {
		this.data.data.disabled = !enabled;
	}

	get levels(): number {
		return 0;
	}

	get cr(): number {
		return this.data.data.cr;
	}

	get cr_adj(): CRAdjustment {
		return this.data.data.cr_adj;
	}

	get children(): Collection<TraitGURPS | TraitContainerGURPS> {
		let m = this.items.filter(e => !(e instanceof TraitModifierGURPS)) as Array<TraitGURPS | TraitContainerGURPS>;
		return new Collection<TraitGURPS | TraitContainerGURPS>(
			m.map((e) => {
				return [e.id!, e];
			}),
		);
	}

	get modifiers(): Collection<TraitModifierGURPS> {
		let m = this.items.filter(e => e instanceof TraitModifierGURPS) as TraitModifierGURPS[];
		return new Collection<TraitModifierGURPS>(
			m.map((e) => {
				return [e.id!, e];
			}),
		);
	}
}

export interface TraitContainerGURPS {
	readonly data: TraitContainerData;
}
