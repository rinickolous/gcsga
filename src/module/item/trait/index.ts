import { ItemGURPS, TraitModifierGURPS } from "@item";
import { CRAdjustment } from "@module/data";
import { PrereqList } from "@module/prereq";
import { ContainerGURPS } from "../container";
import { TraitData } from "./data";

//@ts-ignore
export class TraitGURPS extends ContainerGURPS {
	unsatisfied_reason = "";

	static override get schema(): typeof TraitData {
		return TraitData;
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
		return parseFloat(this.data.data.levels);
	}

	get cr(): number {
		return this.data.data.cr;
	}

	get cr_adj(): CRAdjustment {
		return this.data.data.cr_adj;
	}

	get prereqs(): PrereqList {
		return this.data.data.prereqs;
	}

	get modifiers(): Collection<TraitModifierGURPS> {
		let m = this.items.filter(e => e instanceof TraitModifierGURPS) as TraitModifierGURPS[];
		return new Collection<TraitModifierGURPS>(
			m.map((e) => {
				return [e.id!, e];
			}),
		);
	}

	get prereqsEmpty(): boolean {
		const p = this.prereqs.prereqs.length;
		return p == 0;
	}
}

export interface TraitGURPS {
	readonly data: TraitData;
}
