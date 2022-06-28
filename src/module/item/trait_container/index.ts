import { ItemGURPS, TraitGURPS, TraitModifierGURPS } from "@item";
import { CRAdjustment } from "@module/data";
import { i18n, i18n_f } from "@util";
import { ContainerGURPS } from "../container";
import { TraitContainerData, TraitContainerType } from "./data";

//@ts-ignore
export class TraitContainerGURPS extends ContainerGURPS {
	unsatisfied_reason = "";

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

	get container_type(): TraitContainerType {
		return this.data.data.container_type;
	}

	get children(): Collection<TraitGURPS | TraitContainerGURPS> {
		let m = this.items.filter((e) => !(e instanceof TraitModifierGURPS)) as Array<TraitGURPS | TraitContainerGURPS>;
		return new Collection<TraitGURPS | TraitContainerGURPS>(
			m.map((e) => {
				return [e.id!, e];
			}),
		);
	}

	get modifiers(): Collection<TraitModifierGURPS> {
		let m = this.items.filter((e) => e instanceof TraitModifierGURPS) as TraitModifierGURPS[];
		return new Collection<TraitModifierGURPS>(
			m.map((e) => {
				return [e.id!, e];
			}),
		);
	}

	get modifier_notes(): string {
		let n = "";
		if (this.cr != -1) {
			n += i18n(`gcsga.trait.cr_level.${this.cr}`);
			if (this.cr_adj != "none") {
				n += ", " + i18n_f(`gcsga.trait.cr_adj.${this.cr_adj}`, { penalty: "TODO" });
			}
		}
		this.modifiers.forEach((m) => {
			if (n.length) n += ";";
			n += m.full_description;
		});
		return n;
	}
}

export interface TraitContainerGURPS {
	readonly data: TraitContainerData;
}
